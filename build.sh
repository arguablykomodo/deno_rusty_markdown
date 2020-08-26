#!/bin/sh
cargo build --release --target wasm32-unknown-unknown
wasm-bindgen --target deno --out-dir pkg target/wasm32-unknown-unknown/release/deno_rusty_markdown.wasm
