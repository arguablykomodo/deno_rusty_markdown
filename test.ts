import { parse, html } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.82.0/testing/asserts.ts";

const input = "Hello world, this is a ~~complicated~~ *very simple* example.";

Deno.test("html", () => {
  assertEquals(
    html(input),
    "<p>Hello world, this is a ~~complicated~~ <em>very simple</em> example.</p>\n",
  );
});

Deno.test("html with options", () => {
  assertEquals(
    html(input, { strikethrough: true }),
    "<p>Hello world, this is a <del>complicated</del> <em>very simple</em> example.</p>\n",
  );
});

Deno.test("parse", () => {
  assertEquals(
    parse(input),
    [
      {
        type: "startTag",
        tag: "paragraph",
      },
      {
        type: "text",
        content: "Hello world, this is a ~~complicated~~ ",
      },
      {
        type: "startTag",
        tag: "emphasis",
      },
      {
        type: "text",
        content: "very simple",
      },
      {
        type: "endTag",
        tag: "emphasis",
      },
      {
        type: "text",
        content: " example.",
      },
      {
        type: "endTag",
        tag: "paragraph",
      },
    ],
  );
});

Deno.test("parse with options", () => {
  assertEquals(
    parse(input, { strikethrough: true }),
    [
      {
        type: "startTag",
        tag: "paragraph",
      },
      {
        type: "text",
        content: "Hello world, this is a ",
      },
      {
        type: "startTag",
        tag: "strikethrough",
      },
      {
        type: "text",
        content: "complicated",
      },
      {
        type: "endTag",
        tag: "strikethrough",
      },
      {
        type: "text",
        content: " ",
      },
      {
        type: "startTag",
        tag: "emphasis",
      },
      {
        type: "text",
        content: "very simple",
      },
      {
        type: "endTag",
        tag: "emphasis",
      },
      {
        type: "text",
        content: " example.",
      },
      {
        type: "endTag",
        tag: "paragraph",
      },
    ],
  );
});
