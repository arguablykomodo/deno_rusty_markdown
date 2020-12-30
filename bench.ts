import { parse } from "./mod.ts";
import {
  bench,
  runBenchmarks,
} from "https://deno.land/std@0.82.0/testing/bench.ts";

const input = "Hello world, this is a ~~complicated~~ *very simple* example.";

bench({
  name: "simple parse",
  runs: 1000,
  func(b): void {
    b.start();
    for (let i = 0; i < 1000; i++) {
      parse(input);
    }
    b.stop();
  },
});

bench({
  name: "parse with options",
  runs: 1000,
  func(b): void {
    b.start();
    for (let i = 0; i < 1000; i++) {
      parse(input, { strikethrough: true });
    }
    b.stop();
  },
});

const inputFrontmatter = "---\nfoo: bar\n---\n" + input;
bench({
  name: "parse with frontmatter",
  runs: 1000,
  func(b): void {
    b.start();
    for (let i = 0; i < 1000; i++) {
      parse(inputFrontmatter, { frontmatter: true });
    }
    b.stop();
  },
});

runBenchmarks();
