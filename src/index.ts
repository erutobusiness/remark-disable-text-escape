import type { Literal, Node, Parent } from "mdast";
import type { Options } from "mdast-util-to-markdown";
import type {} from "remark-stringify";
import type { Plugin, Processor } from "unified";
import { SKIP, visit } from "unist-util-visit";

/**
 * A custom node representing a literal `[` or `*` character.
 * By using a custom node type, we bypass remark-stringify's text escaping.
 */
export interface LiteralChar extends Literal {
	type: "literalChar";
	value: "[" | "*";
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

const toMarkdownExtension: Options = {
	handlers: {
		literalChar(node: LiteralChar) {
			return node.value;
		},
	},
};

// biome-ignore lint/suspicious/noExplicitAny: peek requires assignment as a property
(toMarkdownExtension.handlers as any).literalChar.peek = (node: LiteralChar) => node.value;

const remarkDisableBracketEscape: Plugin<[], import("mdast").Root> = function (this: Processor) {
	const data = this.data();
	if (!data.toMarkdownExtensions) {
		data.toMarkdownExtensions = [];
	}
	const extensions = data.toMarkdownExtensions;
	extensions.push(toMarkdownExtension);

	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			if (index === undefined || parent === undefined) return;
			if (!/[\[*]/.test(node.value)) return;

			const parts = node.value.split(/(\[|\*)/);
			const newNodes: Node[] = [];

			for (const part of parts) {
				if (part === "[" || part === "*") {
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

export default remarkDisableBracketEscape;
