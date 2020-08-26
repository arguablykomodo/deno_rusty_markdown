import { greet } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.66.0/testing/asserts.ts";

Deno.test("greet", () => {
  assertEquals(greet("World"), "Hello, World!");
});
