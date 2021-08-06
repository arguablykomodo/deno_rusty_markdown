import { html, parse } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.101.0/testing/asserts.ts";

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
        type: "start",
        tag: "paragraph",
      },
      {
        type: "text",
        content: "Hello world, this is a ~~complicated~~ ",
      },
      {
        type: "start",
        tag: "emphasis",
      },
      {
        type: "text",
        content: "very simple",
      },
      {
        type: "end",
        tag: "emphasis",
      },
      {
        type: "text",
        content: " example.",
      },
      {
        type: "end",
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
        type: "start",
        tag: "paragraph",
      },
      {
        type: "text",
        content: "Hello world, this is a ",
      },
      {
        type: "start",
        tag: "strikethrough",
      },
      {
        type: "text",
        content: "complicated",
      },
      {
        type: "end",
        tag: "strikethrough",
      },
      {
        type: "text",
        content: " ",
      },
      {
        type: "start",
        tag: "emphasis",
      },
      {
        type: "text",
        content: "very simple",
      },
      {
        type: "end",
        tag: "emphasis",
      },
      {
        type: "text",
        content: " example.",
      },
      {
        type: "end",
        tag: "paragraph",
      },
    ],
  );
});

Deno.test("doctests", () => {
  assertEquals(
    html("Hello **World**!"),
    "<p>Hello <strong>World</strong>!</p>\n",
  );

  assertEquals(
    html("Hello ~~Friends~~ **World**!", { strikethrough: true }),
    "<p>Hello <del>Friends</del> <strong>World</strong>!</p>\n",
  );

  assertEquals(
    parse("Foo *Bar*"),
    [
      {
        type: "start",
        tag: "paragraph",
      },
      {
        type: "text",
        content: "Foo ",
      },
      {
        type: "start",
        tag: "emphasis",
      },
      {
        type: "text",
        content: "Bar",
      },
      {
        type: "end",
        tag: "emphasis",
      },
      {
        type: "end",
        tag: "paragraph",
      },
    ],
  );
});
