import { parse } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.82.0/testing/asserts.ts";

const input = "Hello world, this is a ~~complicated~~ *very simple* example.";

Deno.test("parses markdown", () => {
  assertEquals(
    parse(input),
    "<p>Hello world, this is a ~~complicated~~ <em>very simple</em> example.</p>\n",
  );
});

Deno.test("handles options", () => {
  assertEquals(
    parse(input, { strikethrough: true }),
    "<p>Hello world, this is a <del>complicated</del> <em>very simple</em> example.</p>\n",
  );
});
