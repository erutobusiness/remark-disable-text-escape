# remark-disable-text-escape

[![npm version](https://img.shields.io/npm/v/remark-disable-text-escape.svg)](https://www.npmjs.com/package/remark-disable-text-escape)
[![npm downloads](https://img.shields.io/npm/dm/remark-disable-text-escape.svg)](https://www.npmjs.com/package/remark-disable-text-escape)
[![license](https://img.shields.io/npm/l/remark-disable-text-escape.svg)](https://github.com/erutobusiness/remark-disable-text-escape/blob/main/LICENSE)

A [remark](https://github.com/remarkjs/remark) plugin to prevent square brackets (`[`), asterisks (`*`), and underscores (`_`) from being escaped by [remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify).

## Problem

By default, `remark-stringify` escapes `[` characters in text nodes to `\[` to avoid ambiguity with link syntax, `*` characters to `\*` to avoid ambiguity with emphasis syntax, and `_` characters to `\_` to avoid ambiguity with emphasis syntax. This can be undesirable when you want to preserve literal brackets, asterisks, and underscores in your Markdown output (e.g., `**強調**` becoming `\*\*強調\*\*` or `foo_bar_baz` becoming `foo\_bar\_baz`).

## How it works

This plugin uses the **Custom Node Pattern** — it transforms `[`, `*`, and `_` characters in text nodes into custom `literalChar` AST nodes with a dedicated serialization handler. Since `mdast-util-to-markdown` only escapes characters inside `text` nodes, moving them into a custom node bypasses the escaping logic entirely.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). Node.js 16+ is required.

```bash
npm install remark-disable-text-escape
```

## Usage

```js
import { remark } from "remark";
import remarkDisableTextEscape from "remark-disable-text-escape";

const result = await remark()
  .use(remarkDisableTextEscape)
  .process("some text with [brackets]");

console.log(String(result));
// => "some text with [brackets]\n"
```

Asterisks are also preserved:

```js
const result = await remark()
  .use(remarkDisableTextEscape)
  .process("**強調**はエスケープされません");

console.log(String(result));
// => "**強調**はエスケープされません\n"
```

## API

### `remarkDisableTextEscape`

Plugin — no options. Add it to your remark pipeline and all `[`, `*`, and `_` characters in text nodes will be preserved as-is in the output.

## Types

This package is written in TypeScript and ships with type definitions.
It exports the `LiteralChar` type, which represents the custom AST node used internally.

```ts
import type { LiteralChar } from "remark-disable-text-escape";
```

## Compatibility

- Node.js 16+
- `remark-stringify` ^11.0.0 (peer dependency)
- ESM only — cannot be `require()`'d

## Caveats

This plugin disables escaping of `[`, `*`, and `_` in **all** text nodes.
If the output Markdown is later re-parsed, unescaped brackets, asterisks, or underscores may be interpreted as link/image or emphasis syntax, changing the document semantics.
Use this plugin only when you control the final output and do not expect round-trip fidelity.

## License

[MIT](LICENSE)
