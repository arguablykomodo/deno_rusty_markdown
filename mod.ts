// @deno-types="./pkg/deno_rusty_markdown.d.ts"
import { parse as internal_parse } from "./pkg/deno_rusty_markdown.js";

interface Options {
  tables?: boolean;
  footnotes?: boolean;
  strikethrough?: boolean;
  tasklists?: boolean;
}

function parse(text: string, options: Options = {}): string {
  return internal_parse(
    text,
    (+(options.tables ?? false) << 1) +
      (+(options.footnotes ?? false) << 2) +
      (+(options.strikethrough ?? false) << 3) +
      (+(options.tasklists ?? false) << 4),
  );
}

export { Options, parse };
