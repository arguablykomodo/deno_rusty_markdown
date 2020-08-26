import { parse } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.66.0/testing/asserts.ts";

Deno.test("parse", () => {
  const text = "Hello world, this is a ~~complicated~~ *very simple* example.";
  assertEquals(
    parse(text),
    "<p>Hello world, this is a ~~complicated~~ <em>very simple</em> example.</p>\n",
  );
  assertEquals(
    parse(text, { strikethrough: true }),
    "<p>Hello world, this is a <del>complicated</del> <em>very simple</em> example.</p>\n",
  );
});
