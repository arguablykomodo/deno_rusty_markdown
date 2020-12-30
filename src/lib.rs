use pulldown_cmark::{html::push_html, Options, Parser};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn html(text: &str, options: u32) -> String {
    let parser = Parser::new_ext(text, Options::from_bits_truncate(options));
    let mut output: String = String::with_capacity(text.len() * 3 / 2);
    push_html(&mut output, parser);
    output
}

fn set(object: &js_sys::Object, key: &str, value: impl Into<JsValue>) {
    js_sys::Reflect::set(&object, &key.into(), &value.into()).unwrap();
}

#[wasm_bindgen]
pub fn parse(text: &str, options: u32) -> js_sys::Array {
    let parser = Parser::new_ext(text, Options::from_bits_truncate(options));
    let array = js_sys::Array::new();
    for event in parser {
        let object = js_sys::Object::new();
        use pulldown_cmark::Event::*;
        set(
            &object,
            "type",
            match event {
                Start(_) => "startTag",
                End(_) => "endTag",
                Text(_) => "text",
                Code(_) => "code",
                Html(_) => "html",
                FootnoteReference(_) => "footnoteReference",
                SoftBreak => "softBreak",
                HardBreak => "hardBreak",
                Rule => "rule",
                TaskListMarker(_) => "taskListMarker",
            },
        );
        match event {
            FootnoteReference(label) => set(&object, "label", label.into_string()),
            TaskListMarker(checked) => set(&object, "checked", checked),
            Text(content) | Code(content) | Html(content) => {
                set(&object, "content", content.into_string())
            }
            Start(tag) | End(tag) => {
                use pulldown_cmark::Tag::*;
                set(
                    &object,
                    "tag",
                    match tag {
                        Paragraph => "paragraph",
                        Heading(_) => "heading",
                        BlockQuote => "blockQuote",
                        CodeBlock(_) => "codeBlock",
                        List(_) => "list",
                        Item => "listItem",
                        FootnoteDefinition(_) => "footnoteDefinition",
                        Table(_) => "table",
                        TableHead => "tableHead",
                        TableRow => "tableRow",
                        TableCell => "tableCell",
                        Emphasis => "emphasis",
                        Strong => "strong",
                        Strikethrough => "strikethrough",
                        Link(_, _, _) => "link",
                        Image(_, _, _) => "image",
                    },
                );
                match tag {
                    Heading(level) => set(&object, "level", level),
                    FootnoteDefinition(label) => set(&object, "label", label.into_string()),
                    List(data) => match data {
                        None => set(&object, "kind", "unordered"),
                        Some(number) => {
                            set(&object, "kind", "ordered");
                            set(&object, "number", number as i32);
                        }
                    },
                    CodeBlock(kind) => {
                        use pulldown_cmark::CodeBlockKind::*;
                        match kind {
                            Indented => set(&object, "kind", "indented"),
                            Fenced(lang) => {
                                set(&object, "kind", "fenced");
                                set(&object, "lang", lang.into_string());
                            }
                        };
                    }
                    Table(alignment) => {
                        let array = js_sys::Array::new();
                        use pulldown_cmark::Alignment::*;
                        for a in alignment {
                            array.push(
                                &match a {
                                    None => "none",
                                    Left => "left",
                                    Center => "center",
                                    Right => "right",
                                }
                                .into(),
                            );
                        }
                        set(&object, "alignment", array);
                    }
                    Link(kind, url, title) | Image(kind, url, title) => {
                        use pulldown_cmark::LinkType::*;
                        set(
                            &object,
                            "kind",
                            match kind {
                                Inline => "inline",
                                Reference => "reference",
                                ReferenceUnknown => "referenceUnknown",
                                Collapsed => "collapsed",
                                CollapsedUnknown => "collapsedUnknown",
                                Shortcut => "shortcut",
                                ShortcutUnknown => "shortcutUnknown",
                                Autolink => "autolink",
                                Email => "email",
                            },
                        );
                        set(&object, "url", url.into_string());
                        set(&object, "title", title.into_string());
                    }
                    _ => (),
                };
            }
            _ => (),
        }
        array.push(&object);
    }
    return array;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_html() {
        let text = "Hello world, this is a ~~complicated~~ *very simple* example.";
        assert_eq!(
            &html(text, 0),
            "<p>Hello world, this is a ~~complicated~~ <em>very simple</em> example.</p>\n"
        );
        assert_eq!(
            &html(text, 1 << 3),
            "<p>Hello world, this is a <del>complicated</del> <em>very simple</em> example.</p>\n"
        );
    }
}
