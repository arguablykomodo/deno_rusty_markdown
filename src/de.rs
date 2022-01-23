use crate::consts::*;
use js_sys::Array;
use pulldown_cmark::Event;
use wasm_bindgen::JsValue;

fn get(object: &JsValue, key: &str) -> Result<JsValue, JsValue> {
    js_sys::Reflect::get(object, &key.into())
}

fn get_string(object: &JsValue, key: &str) -> Result<String, JsValue> {
    let value = get(object, key)?;
    value.as_string().ok_or(value)
}

fn get_bool(object: &JsValue, key: &str) -> Result<bool, JsValue> {
    let value = get(object, key)?;
    value.as_bool().ok_or(value)
}

fn get_f64(object: &JsValue, key: &str) -> Result<f64, JsValue> {
    let value = get(object, key)?;
    value.as_f64().ok_or(value)
}

pub fn deserialize<'a>(object: JsValue) -> Result<Event<'a>, JsValue> {
    use Event::*;
    let event_type = get_string(&object, TYPE)?;
    Ok(match event_type.as_str() {
        START | END => {
            use pulldown_cmark::{CodeBlockKind::*, Tag::*};
            let tag_type = get_string(&object, TAG)?;
            let tag = match tag_type.as_str() {
                PARAGRAPH => Paragraph,
                HEADING => Heading(
                    {
                        use pulldown_cmark::HeadingLevel::*;
                        let value = get(&object, LEVEL)?;
                        match value.as_f64() {
                            Some(n) => match n as u8 {
                                1 => H1,
                                2 => H2,
                                3 => H3,
                                4 => H4,
                                5 => H5,
                                6 => H6,
                                _ => return Err(value),
                            },
                            None => return Err(value),
                        }
                    },
                    get(&object, ID)?.as_string(),
                    {
                        let source: Array = get(&object, CLASSES)?.into();
                        let mut classes = Vec::with_capacity(source.length() as usize);
                        for class in source.iter() {
                            classes.push(class.as_string().ok_or(class)?.as_str());
                        }
                        classes
                    },
                ),
                BLOCK_QUOTE => BlockQuote,
                CODE_BLOCK => CodeBlock(match get_string(&object, KIND)?.as_str() {
                    INDENTED => Indented,
                    FENCED => Fenced(get_string(&object, LANGUAGE)?.into()),
                    unknown => return Err(unknown.into()),
                }),
                LIST => List(match get_f64(&object, START_NUMBER) {
                    Ok(n) => Some(n as u64),
                    Err(_) => None,
                }),
                LIST_ITEM => Item,
                FOOTNOTE_DEFINITION => FootnoteDefinition(get_string(&object, LABEL)?.into()),
                TABLE => Table({
                    use pulldown_cmark::Alignment::*;
                    let source: Array = get(&object, ALIGNMENTS)?.into();
                    let mut alignments = Vec::with_capacity(source.length() as usize);
                    for alignment in source.iter() {
                        alignments.push(match alignment.as_string().ok_or(alignment)?.as_str() {
                            NONE => None,
                            LEFT => Left,
                            CENTER => Center,
                            RIGHT => Right,
                            unknown => return Err(unknown.into()),
                        });
                    }
                    alignments
                }),
                TABLE_HEAD => TableHead,
                TABLE_ROW => TableRow,
                TABLE_CELL => TableCell,
                EMPHASIS => Emphasis,
                STRONG => Strong,
                STRIKETHROUGH => Strikethrough,
                LINK | IMAGE => {
                    use pulldown_cmark::LinkType::*;
                    let link_type = match get_string(&object, KIND)?.as_str() {
                        INLINE => Inline,
                        REFERENCE => Reference,
                        COLLAPSED => Collapsed,
                        SHORTCUT => Shortcut,
                        AUTOLINK => Autolink,
                        EMAIL => Email,
                        unknown => return Err(unknown.into()),
                    };
                    let url = get_string(&object, URL)?.into();
                    let title = get_string(&object, TITLE)?.into();
                    match tag_type.as_str() {
                        LINK => Link(link_type, url, title),
                        IMAGE => Image(link_type, url, title),
                        _ => unreachable!(),
                    }
                }
                unknown => return Err(unknown.into()),
            };
            match event_type.as_str() {
                START => Start(tag),
                END => End(tag),
                _ => unreachable!(),
            }
        }
        TEXT | CODE | HTML => {
            let content = get_string(&object, CONTENT)?.into();
            match event_type.as_str() {
                TEXT => Text(content),
                CODE => Code(content),
                HTML => Html(content),
                _ => unreachable!(),
            }
        }
        FOOTNOTE_REFERENCE => FootnoteReference(get_string(&object, LABEL)?.into()),
        SOFT_BREAK => SoftBreak,
        HARD_BREAK => HardBreak,
        RULE => Rule,
        TASK_LIST_MARKER => TaskListMarker(get_bool(&object, CHECKED)?),
        unknown => return Err(unknown.into()),
    })
}
