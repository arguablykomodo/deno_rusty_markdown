use crate::consts::*;
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
        TYPE,
        match event {
            Start(_) => START,
            End(_) => END,
            Text(_) => TEXT,
            Code(_) => CODE,
            Html(_) => HTML,
            FootnoteReference(_) => FOOTNOTE_REFERENCE,
            SoftBreak => SOFT_BREAK,
            HardBreak => HARD_BREAK,
            Rule => RULE,
            TaskListMarker(_) => TASK_LIST_MARKER,
        },
    );
    match event {
        Start(tag) | End(tag) => {
            use pulldown_cmark::Tag::*;
            set(
                &object,
                TAG,
                match tag {
                    Paragraph => PARAGRAPH,
                    Heading(_, _, _) => HEADING,
                    BlockQuote => BLOCK_QUOTE,
                    CodeBlock(_) => CODE_BLOCK,
                    List(_) => LIST,
                    Item => LIST_ITEM,
                    FootnoteDefinition(_) => FOOTNOTE_DEFINITION,
                    Table(_) => TABLE,
                    TableHead => TABLE_HEAD,
                    TableRow => TABLE_ROW,
                    TableCell => TABLE_CELL,
                    Emphasis => EMPHASIS,
                    Strong => STRONG,
                    Strikethrough => STRIKETHROUGH,
                    Link(_, _, _) => LINK,
                    Image(_, _, _) => IMAGE,
                },
            );
            match tag {
                Heading(level, id, classes) => {
                    use pulldown_cmark::HeadingLevel::*;
                    set(&object, LEVEL, match level {
                        H1 => 1u8,
                        H2 => 2,
                        H3 => 3,
                        H4 => 4,
                        H5 => 5,
                        H6 => 6,
                    });
                    if let Some(id) = id {
                        set(&object, ID, id);
                    }
                    let array = js_sys::Array::new();
                    for class in classes {
                        array.push(&class.into());
                    }
                    set(&object, CLASSES, array);
                },
                CodeBlock(kind) => {
                    use pulldown_cmark::CodeBlockKind::*;
                    match kind {
                        Indented => set(&object, KIND, INDENTED),
                        Fenced(language) => {
                            set(&object, KIND, FENCED);
                            set(&object, LANGUAGE, language.into_string());
                        }
                    };
                }
                List(number) => match number {
                    Some(number) => set(&object, START_NUMBER, number as i32),
                    None => (),
                },
                FootnoteDefinition(label) => set(&object, LABEL, label.into_string()),
                Table(alignments) => {
                    let array = js_sys::Array::new();
                    use pulldown_cmark::Alignment::*;
                    for alignment in alignments {
                        array.push(
                            &match alignment {
                                None => NONE,
                                Left => LEFT,
                                Center => CENTER,
                                Right => RIGHT,
                            }
                            .into(),
                        );
                    }
                    set(&object, ALIGNMENTS, array);
                }
                Link(kind, url, title) | Image(kind, url, title) => {
                    use pulldown_cmark::LinkType::*;
                    set(
                        &object,
                        KIND,
                        match kind {
                            Inline => INLINE,
                            Reference => REFERENCE,
                            Collapsed => COLLAPSED,
                            Shortcut => SHORTCUT,
                            Autolink => AUTOLINK,
                            Email => EMAIL,
                            ReferenceUnknown | CollapsedUnknown | ShortcutUnknown => {
                                unreachable!()
                            }
                        },
                    );
                    set(&object, URL, url.into_string());
                    set(&object, TITLE, title.into_string());
                }
                _ => (),
            };
        }
        Text(content) | Code(content) | Html(content) => {
            set(&object, CONTENT, content.into_string())
        }
        FootnoteReference(label) => set(&object, LABEL, label.into_string()),
        TaskListMarker(checked) => set(&object, CHECKED, checked),
        _ => (),
    }
    object
}
