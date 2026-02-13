import { remark } from "remark";
import { describe, expect, it } from "vitest";
import remarkDisableTextEscape from "../src/index.js";

function process(input: string): string {
	return remark().use(remarkDisableTextEscape).processSync(input).toString().trim();
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

	it("should handle all special characters together", () => {
		expect(process("[a] | b & c ~ d ! e_f *g*")).toBe("[a] | b & c ~ d ! e_f *g*");
	});
});
