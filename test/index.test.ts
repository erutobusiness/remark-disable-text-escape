import { remark } from "remark";
import { describe, expect, it } from "vitest";
import remarkDisableBracketEscape from "../src/index.js";

function process(input: string): string {
	return remark().use(remarkDisableBracketEscape).processSync(input).toString().trim();
}

describe("remark-disable-bracket-escape", () => {
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
});
