import { html, parse } from "./mod.ts";
import {
  bench,
  runBenchmarks,
} from "https://deno.land/std@0.101.0/testing/bench.ts";

const input = "Hello world, this is a ~~complicated~~ *very simple* example.";

bench({
  name: "html",
  runs: 1000,
  func(b): void {
    b.start();
    for (let i = 0; i < 1000; i++) {
      html(input);
    }
    b.stop();
  },
});

bench({
  name: "html with options",
  runs: 1000,
  func(b): void {
    b.start();
    for (let i = 0; i < 1000; i++) {
      html(input, { strikethrough: true });
    }
    b.stop();
  },
});

bench({
  name: "parse",
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

runBenchmarks();
