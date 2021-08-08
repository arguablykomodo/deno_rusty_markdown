mod consts;
mod de;
mod ser;

use js_sys::Array;
use pulldown_cmark::Options;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn tokens(text: String, options: u32) -> Array {
    let parser = pulldown_cmark::Parser::new_ext(&text, Options::from_bits_truncate(options));
    parser.into_iter().map(ser::serialize).collect()
}

#[wasm_bindgen]
pub fn html(tokens: Array) -> Result<String, JsValue> {
    let events = tokens
        .iter()
        .map(de::deserialize)
        .collect::<Result<Vec<_>, _>>()?;
    let mut html = String::new();
    pulldown_cmark::html::push_html(&mut html, events.into_iter());
    Ok(html)
}
