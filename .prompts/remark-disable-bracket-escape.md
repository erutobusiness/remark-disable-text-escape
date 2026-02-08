# Remark Plugin: Disable Bracket Escaping (Standalone Repository)

You are an expert TypeScript developer specializing in the Unified/Remark ecosystem.
Your goal is to initialize a **new, standalone GitHub repository** named `remark-disable-bracket-escape` and implement a high-quality Remark plugin to prevent `[` escaping.

## Project Overview

-   **Name**: `remark-disable-bracket-escape`
-   **Description**: A Remark plugin to prevent `[` (square brackets) from being automatically escaped to `\[` by `remark-stringify`.
-   **Methodology**: Use **AST Transformation** and **Custom Handlers** to selectively preserve `[` characters without modifying global unsafe definition hacks.

## Core Requirements

### 1. Repository Setup (Modern Best Practices)

Initialize the project in the current directory.

-   **Package Manager**: `npm`
-   **Module System**: **Pure ESM** (`"type": "module"`).
-   **Language**: TypeScript (Strict mode).
-   **Linter/Formatter**: **Biome** (Use `biome.json`).
-   **Testing**: **Vitest**.
-   **CI**: GitHub Actions workflow.

### 2. Implementation Logic (The Best Practice)

Do **NOT** try to patch `compiler.unsafe` lists, as they are often additive and hard to override reliable across versions.
Instead, use the **Custom Node Pattern**:

1.  **AST Transformation (Transformer)**:
    -   Use `unist-util-visit` to visit all `text` nodes.
    -   Identify `[` characters within the text value.
    -   Split the `text` node into a list of nodes: `text` (content before), `bracketLiteral` (the `[`), `text` (content after).
    -   Replace the original text node with these new nodes using `flatMap` or parent modifications.

2.  **Serialization (Extension)**:
    -   Inject a `toMarkdown` extension via `this.data('toMarkdownExtensions', [...])`.
    -   Register a handler for the `bracketLiteral` node type.
    -   The handler should simply return the string `'['`.

**Why this works**: `mdast-util-to-markdown` only escapes characters inside `text` nodes. By moving `[` into a custom node, it bypasses the `text` escaping logic entirely, allowing precise control.

### 3. File Structure

-   `src/index.ts`: The plugin source.
-   `test/index.test.ts`: Tests.
-   `package.json`, `tsconfig.json`, `biome.json`.

## Instructions for Claude Code

1.  **Initialize**: Setup project with `npm init`, `typescript`, `biome`, `vitest`, `remark`, `remark-stringify`, `unist-util-visit`.
2.  **Implement**:
    -   Create the `bracketLiteral` interface extending `Literal`.
    -   Implement the transformer and the `toMarkdown` extension in `src/index.ts`.
3.  **Test**:
    -   Verify `[text]` renders as `[text]`.
    -   Verify `link: [text](url)` renders correctly (preserving the link syntax, but checking if *inside* text is handled).
    -   Verify `nesting: [ [ ] ]`.
4.  **Lint & Build**: Ensure `npm run lint` (biome) and `npm test` pass.

## Deliverables

-   Functional Repository.
-   Implementation using the **Custom Node Pattern**.
-   Verification tests.
