type CodeBlock = {
  kind: "indented";
} | {
  kind: "fenced";
  language: string;
};

type Alignment =
  | "none"
  | "left"
  | "center"
  | "right";

type Link = {
  linkType:
    | "inline"
    | "reference"
    | "collapsed"
    | "shortcut"
    | "autolink"
    | "email";
  url: string;
  title: string;
};

type SimpleTags =
  | "paragraph"
  | "blockQuote"
  | "listItem"
  | "tableHead"
  | "tableRow"
  | "tableCell"
  | "emphasis"
  | "strong"
  | "strikethrough";

type TagCommon<T> = {
  tag: T;
};

type Tag =
  | TagCommon<SimpleTags>
  | TagCommon<"heading"> & { level: number }
  | TagCommon<"codeBlock"> & CodeBlock
  | TagCommon<"list"> & { startNumber?: number }
  | TagCommon<"footnoteDefinition"> & { label: string }
  | TagCommon<"table"> & { alignments: Alignment[] }
  | TagCommon<"link" | "image"> & Link;

type TokenCommon<T> = {
  type: T;
};

export type Token =
  | TokenCommon<"start" | "end"> & Tag
  | TokenCommon<"text" | "code" | "html"> & { content: string }
  | TokenCommon<"footnoteReference"> & { label: string }
  | TokenCommon<"softBreak" | "hardBreak" | "rule">
  | TokenCommon<"taskListMarker"> & { checked: boolean };
