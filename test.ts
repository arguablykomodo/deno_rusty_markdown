import { parse } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts";

const input = "Hello world, this is a ~~complicated~~ *very simple* example.";

const output =
  "<p>Hello world, this is a ~~complicated~~ <em>very simple</em> example.</p>\n";
Deno.test("parses markdown", () => {
  assertEquals(parse(input), { parsed: output });
});

const striked =
  "<p>Hello world, this is a <del>complicated</del> <em>very simple</em> example.</p>\n";
Deno.test("handles options", () => {
  assertEquals(parse(input, { strikethrough: true }), { parsed: striked });
});

Deno.test("handles frontmatter", () => {
  assertEquals(
    parse("---\nfoo: bar\n---\n" + input, { frontmatter: true }),
    { parsed: output, frontmatter: { foo: "bar" } },
  );
});
