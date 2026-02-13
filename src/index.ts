import type { Image, Link, Literal, Node, Parent } from "mdast";
import type { ConstructName, Info, Options, State } from "mdast-util-to-markdown";
import type {} from "remark-stringify";
import type { Plugin, Processor } from "unified";
import { SKIP, visit } from "unist-util-visit";

export interface RemarkDisableTextEscapeOptions {
	aliasDivider?: string;
}

/**
 * A custom node representing a literal character that should not be escaped.
 * By using a custom node type, we bypass remark-stringify's text escaping.
 */
export interface LiteralChar extends Literal {
	type: "literalChar";
	value: "[" | "]" | "(" | ")" | "*" | "_" | "&" | "|" | "~" | "!";
}

declare module "mdast" {
	interface PhrasingContentMap {
		literalChar: LiteralChar;
	}
	interface RootContentMap {
		literalChar: LiteralChar;
	}
}

declare module "mdast-util-to-markdown" {
	interface ConstructNameMap {
		literalChar: "literalChar";
	}
}

/**
 * Remove backslash escapes added by state.safe() for characters
 * that this plugin intends to keep removeEscapesd.
 */
function removeEscapes(value: string): string {
	return value.replace(/\\([&])/g, "$1");
}

/**
 * Get the concatenated text content of a link node's children.
 * Works with both text nodes and literalChar nodes.
 */
function childrenToText(node: Link): string {
	return node.children
		.map((c) => ("value" in c && typeof c.value === "string" ? c.value : ""))
		.join("");
}

/**
 * Check if a link node should be formatted as an autolink.
 * Unlike formatLinkAsAutolink from mdast-util-to-markdown, this works
 * with literalChar nodes in children (after tree transformation).
 */
function shouldAutolink(node: Link, state: State): boolean {
	const raw = childrenToText(node);
	return Boolean(
		!state.options.resourceLink &&
			node.url &&
			!node.title &&
			node.children &&
			(raw === node.url || `mailto:${raw}` === node.url) &&
			/^[a-z][a-z+.-]+:/i.test(node.url) &&
			!/[\0- <>\u007F]/.test(node.url),
	);
}

// biome-ignore lint/suspicious/noExplicitAny: handler signature requires any for node parameter
function linkHandler(node: Link, _: any, state: State, info: Info): string {
	const tracker = state.createTracker(info);

	if (shouldAutolink(node, state)) {
		const stack = state.stack;
		state.stack = [];
		const exit = state.enter("autolink");
		let value = tracker.move("<");
		value += tracker.move(
			state.containerPhrasing(node, {
				before: value,
				after: ">",
				...tracker.current(),
			}),
		);
		value += tracker.move(">");
		exit();
		state.stack = stack;
		return value;
	}

	const exit = state.enter("link");
	let subexit = state.enter("label");
	let value = tracker.move("[");
	value += tracker.move(
		state.containerPhrasing(node, {
			before: value,
			after: "](",
			...tracker.current(),
		}),
	);
	value += tracker.move("](");
	subexit();

	if (/[()]/.test(node.url) || (!node.url && node.title) || /[\0- \u007F]/.test(node.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(
			removeEscapes(
				state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current(),
				}),
			),
		);
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(
			removeEscapes(
				state.safe(node.url, {
					before: value,
					after: node.title ? " " : ")",
					...tracker.current(),
				}),
			),
		);
	}
	subexit();

	if (node.title) {
		const quote = state.options.quote || '"';
		const suffix = quote === '"' ? "Quote" : "Apostrophe";
		subexit = state.enter(`title${suffix}` as ConstructName);
		value += tracker.move(` ${quote}`);
		value += tracker.move(
			state.safe(node.title, {
				before: value,
				after: quote,
				...tracker.current(),
			}),
		);
		value += tracker.move(quote);
		subexit();
	}

	value += tracker.move(")");
	exit();
	return value;
}

// biome-ignore lint/suspicious/noExplicitAny: handler signature requires any for node parameter
function linkPeek(node: Link, _: any, state: State): string {
	return shouldAutolink(node, state) ? "<" : "[";
}

// biome-ignore lint/suspicious/noExplicitAny: handler signature requires any for node parameter
function imageHandler(node: Image, _: any, state: State, info: Info): string {
	const exit = state.enter("image");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("![");
	value += tracker.move(
		state.safe(node.alt, {
			before: value,
			after: "]",
			...tracker.current(),
		}),
	);
	value += tracker.move("](");
	subexit();

	if (/[()]/.test(node.url) || (!node.url && node.title) || /[\0- \u007F]/.test(node.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(
			removeEscapes(
				state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current(),
				}),
			),
		);
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(
			removeEscapes(
				state.safe(node.url, {
					before: value,
					after: node.title ? " " : ")",
					...tracker.current(),
				}),
			),
		);
	}
	subexit();

	if (node.title) {
		const quote = state.options.quote || '"';
		const suffix = quote === '"' ? "Quote" : "Apostrophe";
		subexit = state.enter(`title${suffix}` as ConstructName);
		value += tracker.move(` ${quote}`);
		value += tracker.move(
			state.safe(node.title, {
				before: value,
				after: quote,
				...tracker.current(),
			}),
		);
		value += tracker.move(quote);
		subexit();
	}

	value += tracker.move(")");
	exit();
	return value;
}

function imagePeek(): string {
	return "!";
}

function createWikiLinkHandler(aliasDivider: string) {
	// biome-ignore lint/suspicious/noExplicitAny: wikiLink node type is defined by remark-wiki-link
	return (node: any) => {
		const nodeValue: string = node.value;
		const nodeAlias: string = node.data.alias;
		if (nodeAlias !== nodeValue) {
			return `[[${nodeValue}${aliasDivider}${nodeAlias}]]`;
		}
		return `[[${nodeValue}]]`;
	};
}

function createToMarkdownExtension(options: RemarkDisableTextEscapeOptions): Options {
	const handlers: Record<string, unknown> = {
		literalChar(node: LiteralChar) {
			return node.value;
		},
		link: linkHandler,
		image: imageHandler,
		wikiLink: createWikiLinkHandler(options.aliasDivider || "|"),
	};
	const extension: Options = {
		handlers: handlers as Options["handlers"],
	};

	// biome-ignore lint/suspicious/noExplicitAny: peek requires assignment as a property
	(extension.handlers as any).literalChar.peek = (node: LiteralChar) => node.value;
	// biome-ignore lint/suspicious/noExplicitAny: peek requires assignment as a property
	(extension.handlers as any).link.peek = linkPeek;
	// biome-ignore lint/suspicious/noExplicitAny: peek requires assignment as a property
	(extension.handlers as any).image.peek = imagePeek;

	return extension;
}

const remarkDisableTextEscape: Plugin<[RemarkDisableTextEscapeOptions?], import("mdast").Root> =
	function (this: Processor, options?: RemarkDisableTextEscapeOptions) {
		const data = this.data();
		if (!data.toMarkdownExtensions) {
			data.toMarkdownExtensions = [];
		}
		const extensions = data.toMarkdownExtensions;
		extensions.push(createToMarkdownExtension(options || {}));

		return (tree) => {
			visit(tree, "text", (node, index, parent) => {
				if (index === undefined || parent === undefined) return;
				if (!/[\[\]()*_&|~!]/.test(node.value)) return;

				const parts = node.value.split(/([\[\]()*_&|~!])/);
				const newNodes: Node[] = [];

				for (const part of parts) {
					if (/^[\[\]()*_&|~!]$/.test(part)) {
						newNodes.push({ type: "literalChar", value: part } as Node);
					} else if (part.length > 0) {
						newNodes.push({ type: "text", value: part } as Node);
					}
				}

				(parent as Parent).children.splice(index, 1, ...(newNodes as never[]));
				return [SKIP, index + newNodes.length] as const;
			});
		};
	};

export default remarkDisableTextEscape;
