import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";
import { html, Options, Token, tokens } from "./mod.ts";

const testData: Array<[string, Options, Token[], string]> = [
  [
    "foo",
    {},
    [
      { type: "start", tag: "paragraph" },
      { type: "text", content: "foo" },
      { type: "end", tag: "paragraph" },
    ],
    "<p>foo</p>\n",
  ],
  [
    "*italic* **bold** ***both***",
    {},
    [
      { tag: "paragraph", type: "start" },
      { tag: "emphasis", type: "start" },
      { content: "italic", type: "text" },
      { tag: "emphasis", type: "end" },
      { content: " ", type: "text" },
      { tag: "strong", type: "start" },
      { content: "bold", type: "text" },
      { tag: "strong", type: "end" },
      { content: " ", type: "text" },
      { tag: "emphasis", type: "start" },
      { tag: "strong", type: "start" },
      { content: "both", type: "text" },
      { tag: "strong", type: "end" },
      { tag: "emphasis", type: "end" },
      { tag: "paragraph", type: "end" },
    ],
    "<p><em>italic</em> <strong>bold</strong> <em><strong>both</strong></em></p>\n",
  ],
  [
    "- [ ] foo\n- [x] bar",
    { tasklists: true },
    [
      { type: "start", tag: "list" },
      { type: "start", tag: "listItem" },
      { type: "taskListMarker", checked: false },
      { type: "text", content: "foo" },
      { type: "end", tag: "listItem" },
      { type: "start", tag: "listItem" },
      { type: "taskListMarker", checked: true },
      { type: "text", content: "bar" },
      { type: "end", tag: "listItem" },
      { type: "end", tag: "list" },
    ],
    `<ul>
<li><input disabled="" type="checkbox"/>
foo</li>
<li><input disabled="" type="checkbox" checked=""/>
bar</li>
</ul>
`,
  ],
  [
    "[foo][bar]\n\n[bar]:http://www.example.com/",
    {},
    [
      { type: "start", tag: "paragraph" },
      {
        type: "start",
        tag: "link",
        kind: "reference",
        title: "",
        url: "http://www.example.com/",
      },
      { type: "text", content: "foo" },
      {
        type: "end",
        tag: "link",
        kind: "reference",
        title: "",
        url: "http://www.example.com/",
      },
      { type: "end", tag: "paragraph" },
    ],
    "",
  ],
];

Deno.test("integration", () => {
  for (const [text, options, testTokens, testHtml] of testData) {
    const tokenized = tokens(text, options);
    assertEquals(tokenized, testTokens);
    assertEquals(html(tokenized), testHtml);
  }
});
