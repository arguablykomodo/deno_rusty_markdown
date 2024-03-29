# `rusty_markdown`

Deno bindings for [`pulldown-cmark`][1], a CommonMark-compliant Markdown parser
made in Rust, compiled to WebAssembly.

## Example

```ts
import { html, tokens } from "https://deno.land/x/rusty_markdown/mod.ts";

const tokenized = tokens("~~Goodbye~~ Hello **World**!", { strikethrough: true }));
console.log(tokenized);
// [
//   { type: "start", tag: "paragraph" },
//   { type: "start", tag: "strikethrough" },
//   { type: "text", content: "Goodbye" },
//   { type: "end", tag: "strikethrough" },
//   { type: "text", content: " Hello " },
//   { type: "start", tag: "strong" },
//   { type: "text", content: "World" },
//   { type: "end", tag: "strong" },
//   { type: "text", content: "!" },
//   { type: "end", tag: "paragraph" }
// ]

const rendered = html(tokenized);
console.log(html);
// <p><del>Goodbye</del> Hello <strong>World</strong>!</p>
```

## Repo Structure

The files in the `wasm` directory are generated by `build.ts`, and contain the
webassembly code, compressed and encoded into base64, alongside boilerplate js
generated by `wasm-bindgen` for interacting with it. If you want to build it
yourself, you will need to make sure you have `wasm-bindgen-cli` installed, and
you are using the same version as the one in `Cargo.toml`.

[1]:https://github.com/raphlinus/pulldown-cmark
