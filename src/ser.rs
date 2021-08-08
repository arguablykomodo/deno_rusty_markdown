use js_sys::Object;
use pulldown_cmark::Event;
use wasm_bindgen::JsValue;

fn set(object: &Object, key: &str, value: impl Into<JsValue>) {
    js_sys::Reflect::set(&object, &key.into(), &value.into()).unwrap();
}

pub fn serialize(event: Event) -> Object {
    let object = Object::new();
    use Event::*;
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
    object
}
