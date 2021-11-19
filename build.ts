#!/usr/bin/env -S deno run --allow-read=wasm --allow-write=wasm --allow-run
import { emptyDir } from "https://deno.land/std@0.114.0/fs/empty_dir.ts";
import { encode } from "https://deno.land/std@0.114.0/encoding/base64.ts";
import { compress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";

async function run(cmd: string) {
  const command = Deno.run({ cmd: cmd.split(" ") });
  if (!(await command.status()).success) return Deno.exit(1);
}

const dir = "wasm";
const name = "deno_rusty_markdown";
const target = "wasm32-unknown-unknown";

await emptyDir(dir);
await run(`cargo +nightly build --release --target ${target}`);
await run(`wasm-bindgen --reference-types --target deno --out-dir ${dir} target/${target}/release/${name}.wasm`);

const wasm = await Deno.readFile(`${dir}/${name}_bg.wasm`);
const encoded = encode(compress(wasm));

const search =
`const wasm_url = new URL('${name}_bg.wasm', import.meta.url);
let wasmCode = '';
switch (wasm_url.protocol) {
    case 'file:':
    wasmCode = await Deno.readFile(wasm_url);
    break
    case 'https:':
    case 'http:':
    wasmCode = await (await fetch(wasm_url)).arrayBuffer();
    break
    default:
    throw new Error(\`Unsupported protocol: \${wasm_url.protocol}\`);
    break
}`;
const replace =
`import { decode } from "https://deno.land/std@0.114.0/encoding/base64.ts";
import { decompress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";
const wasmCode = decompress(new Uint8Array(decode("${encoded}")));`;

const js = await Deno.readTextFile(`${dir}/${name}.js`);
await Deno.writeTextFile(`${dir}/${name}.js`, js.replace(search, replace));
