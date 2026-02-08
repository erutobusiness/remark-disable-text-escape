# Remark Plugin: Add Asterisk Support

You are an expert TypeScript developer specializing in the Unified/Remark ecosystem.
Your goal is to **update** the existing `remark-disable-bracket-escape` plugin to also prevent escaping of **asterisks (`*`)**, allowing forced emphasis even in contexts where Remark's parser might standardly disallow it (e.g., intra-word CJK containing `\*\*`).

## Context

-   **Current State**: The plugin currently prevents `[` from being escaped using a Custom Node Pattern (replacing `[` with a custom node).
-   **New Requirement**: The user encounters `\*\*` escaping in valid Japanese sentences (e.g., `を\*\*強調\*\*`). The user wants `**` to remain as `**` in the output Markdown so that it renders as bold in viewers, even if Remark's parser initially treats it as text.
-   **Goal**: Prevent `[` AND `*` from being escaped.

## Instructions

1.  **Analyze**: Read `src/index.ts` to understand the current `unist-util-visit` implementation for `[`.
2.  **Refactor & Implement**:
    -   Modify the regex/logic to match **both** `[` and `*`.
    -   Update the node transformation logic to handle `*` as a custom node (e.g., reuse the existing custom node type or rename it to something generic like `literalChar`).
    -   Ensure the `toMarkdown` extension handles both characters correctly.
3.  **Test**:
    -   Update `test/index.test.ts`.
    -   Add test cases for:
        -   `text**bold**text` -> `text**bold**text`
        -   `を**強調**する` -> `を**強調**する`
        -   `*italic*` -> `*italic*`
    -   Ensure existing `[` tests still pass.
4.  **Verify**: Run `npm test` and ensure all tests pass.

## Deliverables

-   Updated `src/index.ts`
-   Updated `test/index.test.ts`
