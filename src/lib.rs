use pulldown_cmark::{html::push_html, Options, Parser};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn parse(text: &str, options: u32) -> String {
    let parser = Parser::new_ext(text, Options::from_bits_truncate(options));
    let mut output: String = String::with_capacity(text.len() * 3 / 2);
    push_html(&mut output, parser);
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse() {
        let text = "Hello world, this is a ~~complicated~~ *very simple* example.";
        assert_eq!(
            &parse(text, 0),
            "<p>Hello world, this is a ~~complicated~~ <em>very simple</em> example.</p>\n"
        );
        assert_eq!(
            &parse(text, 1 << 3),
            "<p>Hello world, this is a <del>complicated</del> <em>very simple</em> example.</p>\n"
        );
    }
}
