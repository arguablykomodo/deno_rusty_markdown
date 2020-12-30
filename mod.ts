// @deno-types="./pkg/deno_rusty_markdown.d.ts"
import {
  html as internalHtml,
  parse as internalParse,
} from "./pkg/deno_rusty_markdown.js";

/**
 * Option object containing flags for enabling extra features that are not part
 * of the CommonMark spec.
 */
export interface Options {
  /** Enables Github flavored tables. */
  tables?: boolean;
  /**
   * Enables footnotes\[^1\].
   *
   * \[^1\]: Like this.
   */
  footnotes?: boolean;
  /** Enables strikethrough text, \~\~like this\~\~. */
  strikethrough?: boolean;
  /** Enables Github flavored task lists. */
  tasklists?: boolean;
  /** Enables smart punctuation (turns -- into –) */
  smartPunctuation?: boolean;
}

/**
 * Encodes options to pass them to WebAssembly
 *
 * @param options - Options to encode
 * @returns Encoded options
 */
function encodeOptions(options: Options): number {
  return (+(options.tables ?? false) << 1) +
    (+(options.footnotes ?? false) << 2) +
    (+(options.strikethrough ?? false) << 3) +
    (+(options.tasklists ?? false) << 4) +
    (+(options.smartPunctuation ?? false) << 5);
}

/**
 * Parses the given Markdown into HTML.
 *
 * @param text - Source Markdown text
 * @param options - Extra enabled features
 * @returns Parsed HTML
 */
export function html(
  text: string,
  options: Options = {},
): string {
  return internalHtml(text, encodeOptions(options));
}

type Token = {
  type: "softBreak" | "hardBreak" | "Rule";
} | {
  type: "footnoteReference";
  label: string;
} | {
  type: "taskListMarker";
  checked: boolean;
} | {
  type: "text" | "code" | "html";
  content: string;
} | {
  type: "startTag" | "endTag";
  tag:
    | "paragraph"
    | "blockQuote"
    | "listItem"
    | "tableHead"
    | "tableRow"
    | "tableCell"
    | "emphasis"
    | "strong"
    | "strikethrough";
} | {
  type: "startTag" | "endTag";
  tag: "heading";
  level: number;
} | {
  type: "startTag" | "endTag";
  tag: "footnoteDefinition";
  label: string;
} | {
  type: "startTag" | "endTag";
  tag: "list";
  kind: "unordered";
} | {
  type: "startTag" | "endTag";
  tag: "list";
  kind: "ordered";
  number: number;
} | {
  type: "startTag" | "endTag";
  tag: "codeBlock";
  kind: "indented";
} | {
  type: "startTag" | "endTag";
  tag: "codeBlock";
  kind: "fenced";
  lang: string;
} | {
  type: "startTag" | "endTag";
  tag: "table";
  alignment: ("none" | "left" | "center" | "right")[];
} | {
  type: "startTag" | "endTag";
  tag: "link" | "image";
  kind:
    | "inline"
    | "reference"
    | "referenceUnknown"
    | "collapsed"
    | "collapsedUnknown"
    | "shortcut"
    | "shortcutUnknown"
    | "autolink"
    | "email";
  url: string;
  title: string;
};

/**
 * Parses the given Markdown into a list of tokens.
 *
 * @param text - Source Markdown text
 * @param options - Extra enabled features
 * @returns Token list
 */
export function parse(
  text: string,
  options: Options = {},
): Token[] {
  return internalParse(text, encodeOptions(options));
}
