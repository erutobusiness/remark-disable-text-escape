# remark-disable-text-escape

[![npm version](https://img.shields.io/npm/v/remark-disable-text-escape.svg)](https://www.npmjs.com/package/remark-disable-text-escape)
[![npm downloads](https://img.shields.io/npm/dm/remark-disable-text-escape.svg)](https://www.npmjs.com/package/remark-disable-text-escape)
[![license](https://img.shields.io/npm/l/remark-disable-text-escape.svg)](https://github.com/erutobusiness/remark-disable-text-escape/blob/main/LICENSE)

A [remark](https://github.com/remarkjs/remark) plugin to prevent special characters from being escaped by [remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify).

## Problem

By default, `remark-stringify` escapes special characters in text nodes (e.g., `[` → `\[`, `*` → `\*`, `_` → `\_`, `(` → `\(`, `@` → `\@`) to avoid ambiguity with Markdown syntax. This can be undesirable when you want to preserve these characters as-is in your Markdown output (e.g., `**強調**` becoming `\*\*強調\*\*` or `foo_bar_baz` becoming `foo\_bar\_baz`).

Additionally:

- Parentheses and ampersands in link/image URLs are escaped (e.g., `[text](url(x))` → `[text](url\(x\))`, `[text](a&b)` → `[text](a\&b)`)
- Autolinks containing special characters lose their format (e.g., `<http://a_b.com>` → `[http://a_b.com](http://a_b.com)`)
- When used with [remark-wiki-link](https://github.com/landakram/remark-wiki-link), underscores in WikiLinks are escaped (e.g., `[[page_name]]` → `[[page\_name]]`)

## How it works

This plugin works in three ways:

1. **Custom Node Pattern** — transforms special characters in text nodes into custom `literalChar` AST nodes with a dedicated serialization handler. Since `mdast-util-to-markdown` only escapes characters inside `text` nodes, moving them into a custom node bypasses the escaping logic entirely.

2. **Custom link/image handlers** — overrides the default `link` and `image` handlers to correctly detect autolinks even after tree transformation, and to use angle bracket syntax (`<url>`) for URLs containing parentheses to avoid escaping.

3. **Custom wikiLink handler** — overrides the `remark-wiki-link` handler to output values directly without escaping.

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
  .process("some text with [brackets] and foo_bar_baz");

console.log(String(result));
// => "some text with [brackets] and foo_bar_baz\n"
```

Autolinks with special characters are preserved:

```js
const result2 = await remark()
  .use(remarkDisableTextEscape)
  .process("<http://a_b.com>");

console.log(String(result2));
// => "<http://a_b.com>\n"
```

Parentheses in link URLs are not escaped:

```js
const result3 = await remark()
  .use(remarkDisableTextEscape)
  .process("[text](url(x))");

console.log(String(result3));
// => "[text](<url(x)>)\n"
```

### With remark-wiki-link

```js
import remarkWikiLink from "remark-wiki-link";

const result4 = await remark()
  .use(remarkWikiLink, { aliasDivider: "|" })
  .use(remarkDisableTextEscape, { aliasDivider: "|" })
  .process("[[page_name]]");

console.log(String(result4));
// => "[[page_name]]\n"
```

## API

### `remarkDisableTextEscape(options?)`

Plugin to disable escaping of special characters.

All special characters (`[`, `]`, `(`, `)`, `*`, `_`, `&`, `|`, `~`, `!`, `@`) in text nodes will be preserved as-is in the output. Autolink format is preserved, and parentheses/ampersands/at-signs in link/image URLs are not escaped.

#### `options.aliasDivider`

Type: `string`
Default: `"|"`

The alias divider used by [remark-wiki-link](https://github.com/landakram/remark-wiki-link). Set this to the same value as the `aliasDivider` option in your `remark-wiki-link` configuration.

## Types

This package is written in TypeScript and ships with type definitions.
It exports the `LiteralChar` and `RemarkDisableTextEscapeOptions` types.

```ts
import type {
  LiteralChar,
  RemarkDisableTextEscapeOptions,
} from "remark-disable-text-escape";
```

## Compatibility

- Node.js 16+
- `remark-stringify` ^11.0.0 (peer dependency)
- `remark-wiki-link` ^2.0.0 (optional — wikiLink handler is only active when this plugin is used)
- ESM only — cannot be `require()`'d

## Caveats

This plugin disables escaping of special characters (`[`, `]`, `(`, `)`, `*`, `_`, `&`, `|`, `~`, `!`, `@`) in **all** text nodes, and prevents escaping of parentheses, ampersands, and at-signs in link/image URLs.
If the output Markdown is later re-parsed, unescaped characters may be interpreted as Markdown syntax, changing the document semantics.
Use this plugin only when you control the final output and do not expect round-trip fidelity.

## License

[MIT](LICENSE)
