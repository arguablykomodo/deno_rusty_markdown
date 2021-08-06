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
                Start(_) => "start",
                End(_) => "end",
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
                    List(number) => match number {
                        Some(number) => set(&object, "startNumber", number as i32),
                        None => (),
                    },
                    CodeBlock(kind) => {
                        use pulldown_cmark::CodeBlockKind::*;
                        match kind {
                            Indented => set(&object, "kind", "indented"),
                            Fenced(language) => {
                                set(&object, "kind", "fenced");
                                set(&object, "language", language.into_string());
                            }
                        };
                    }
                    Table(alignments) => {
                        let array = js_sys::Array::new();
                        use pulldown_cmark::Alignment::*;
                        for alignment in alignments {
                            array.push(
                                &match alignment {
                                    None => "none",
                                    Left => "left",
                                    Center => "center",
                                    Right => "right",
                                }
                                .into(),
                            );
                        }
                        set(&object, "alignments", array);
                    }
                    Link(kind, url, title) | Image(kind, url, title) => {
                        use pulldown_cmark::LinkType::*;
                        set(
                            &object,
                            "kind",
                            match kind {
                                Inline => "inline",
                                Reference => "reference",
                                Collapsed => "collapsed",
                                Shortcut => "shortcut",
                                Autolink => "autolink",
                                Email => "email",
                                ReferenceUnknown | CollapsedUnknown | ShortcutUnknown => {
                                    unreachable!()
                                }
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
