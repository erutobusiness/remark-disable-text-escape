import { remark } from "remark";
import remarkWikiLink from "remark-wiki-link";
import { describe, expect, it } from "vitest";
import remarkDisableTextEscape from "../src/index.js";

function process(input: string): string {
	return remark().use(remarkDisableTextEscape).processSync(input).toString().trim();
}

function processWithWikiLink(input: string): string {
	return remark()
		.use(remarkWikiLink, { aliasDivider: "|" })
		.use(remarkDisableTextEscape, { aliasDivider: "|" })
		.processSync(input)
		.toString()
		.trim();
}

describe("remark-disable-text-escape", () => {
	it("should preserve brackets without escaping", () => {
		expect(process("[text]")).toBe("[text]");
	});

	it("should keep links working correctly", () => {
		expect(process("[text](url)")).toBe("[text](url)");
	});

	it("should handle nested brackets", () => {
		expect(process("[ [ ] ]")).toBe("[ [ ] ]");
	});

	it("should pass through text without brackets unchanged", () => {
		expect(process("hello world")).toBe("hello world");
	});

	it("should handle mixed content with brackets and formatting", () => {
		expect(process("before [middle] after **bold**")).toBe("before [middle] after **bold**");
	});

	it("should handle brackets at start and end", () => {
		expect(process("[start and end]")).toBe("[start and end]");
	});

	it("should preserve asterisks in bold syntax", () => {
		expect(process("text**bold**text")).toBe("text**bold**text");
	});

	it("should preserve asterisks in bold with Japanese text", () => {
		expect(process("を**強調**する")).toBe("を**強調**する");
	});

	it("should preserve asterisks in italic syntax", () => {
		expect(process("*italic*")).toBe("*italic*");
	});

	it("should handle mixed brackets and asterisks", () => {
		expect(process("[link] and **bold**")).toBe("[link] and **bold**");
	});

	it("should not escape underscores in identifiers", () => {
		expect(process("foo_bar_baz")).toBe("foo_bar_baz");
	});

	it("should not escape underscores around text", () => {
		expect(process("a _ b _ c")).toBe("a _ b _ c");
	});

	it("should handle mixed underscores, brackets, and asterisks", () => {
		expect(process("[link] and **bold** and foo_bar_baz")).toBe(
			"[link] and **bold** and foo_bar_baz",
		);
	});

	it("should not escape ampersands", () => {
		expect(process("A & B")).toBe("A & B");
	});

	it("should not escape ampersands in text", () => {
		expect(process("AT&T")).toBe("AT&T");
	});

	it("should handle mixed ampersands with other special characters", () => {
		expect(process("[link] & **bold** & foo_bar")).toBe("[link] & **bold** & foo_bar");
	});

	it("should not escape closing brackets", () => {
		expect(process("]text[")).toBe("]text[");
	});

	it("should not escape pipe characters", () => {
		expect(process("A | B | C")).toBe("A | B | C");
	});

	it("should not escape tildes", () => {
		expect(process("~approx~")).toBe("~approx~");
	});

	it("should not escape exclamation marks", () => {
		expect(process("!important")).toBe("!important");
	});

	it("should not escape exclamation before bracket", () => {
		expect(process("![alt]")).toBe("![alt]");
	});

	it("should not escape parentheses", () => {
		expect(process("foo(bar)")).toBe("foo(bar)");
	});

	it("should not escape parentheses after brackets", () => {
		expect(process("text ](url) text")).toBe("text ](url) text");
	});

	it("should handle all special characters together", () => {
		expect(process("[a](b) | c & d ~ e ! f_g *h*")).toBe("[a](b) | c & d ~ e ! f_g *h*");
	});

	it("should preserve autolink format with special chars in URL", () => {
		expect(process("<http://a_b.com>")).toBe("<http://a_b.com>");
	});

	it("should preserve autolink format without special chars", () => {
		expect(process("<http://example.com>")).toBe("<http://example.com>");
	});

	it("should preserve autolink with asterisk in URL", () => {
		expect(process("<http://ex*mple.com>")).toBe("<http://ex*mple.com>");
	});

	it("should not escape parentheses in link URLs", () => {
		expect(process("[text](url(x))")).toBe("[text](<url(x)>)");
	});

	it("should not escape parentheses in image URLs", () => {
		expect(process("![alt](image(1).png)")).toBe("![alt](<image(1).png>)");
	});

	it("should preserve underscores in link text", () => {
		expect(process("[a_b](http://x.com)")).toBe("[a_b](http://x.com)");
	});

	it("should preserve link with title", () => {
		expect(process('[text](url "title")')).toBe('[text](url "title")');
	});

	it("should not escape ampersands in link URLs", () => {
		expect(process("[text](a&b)")).toBe("[text](a&b)");
	});

	it("should not escape ampersands in query strings", () => {
		expect(process("[text](url?x=1&y=2)")).toBe("[text](url?x=1&y=2)");
	});

	it("should not escape ampersands in image URLs", () => {
		expect(process("![alt](img?a=1&b=2)")).toBe("![alt](img?a=1&b=2)");
	});

	it("should not escape @ in text", () => {
		expect(process("text@text")).toBe("text@text");
	});

	it("should not escape @ with spaces", () => {
		expect(process("A @ B")).toBe("A @ B");
	});

	it("should not escape @ in mailto link URLs", () => {
		expect(process("[text](mailto:user@example.com)")).toBe("[text](mailto:user@example.com)");
	});

	it("should not escape underscores in wikiLink value", () => {
		expect(processWithWikiLink("[[a_b]]")).toBe("[[a_b]]");
	});

	it("should not escape underscores in wikiLink with alias", () => {
		expect(processWithWikiLink("[[a_b|alias]]")).toBe("[[a_b|alias]]");
	});

	it("should not escape underscores in wikiLink alias", () => {
		expect(processWithWikiLink("[[page|a_b]]")).toBe("[[page|a_b]]");
	});
});
