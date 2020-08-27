#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import { emptyDir } from "https://deno.land/std@0.66.0/fs/empty_dir.ts";
import { encode } from "https://deno.land/std@0.66.0/encoding/base64.ts";
import { compress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";

const dir = "pkg";
const name = "deno_rusty_markdown";

await emptyDir(dir);
await Deno.run({ cmd: ["cargo", "build", "--release", "--target", "wasm32-unknown-unknown"] }).status();
await Deno.run({ cmd: ["wasm-bindgen", "--target", "deno", "--out-dir", dir, `target/wasm32-unknown-unknown/release/${name}.wasm`] }).status();

const wasm = await Deno.readFile(`${dir}/${name}_bg.wasm`);
const encoded = encode(compress(wasm));
await Deno.remove(`${dir}/${name}_bg.wasm`);

const search = String.raw`const file = new URL(import.meta.url).pathname;
const wasmFile = file.substring(0, file.lastIndexOf(Deno.build.os === 'windows' ? '\\' : '/') + 1) + '${name}_bg.wasm';
const wasmModule = new WebAssembly.Module(Deno.readFileSync(wasmFile));`;
const replace = `import { decode } from "https://deno.land/std@0.66.0/encoding/base64.ts";
import { decompress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";
const wasmModule = new WebAssembly.Module(decompress(decode("${encoded}")));`;

const js = await Deno.readTextFile(`${dir}/${name}.js`);
await Deno.writeTextFile(`${dir}/${name}.js`, js.replace(search, replace));
