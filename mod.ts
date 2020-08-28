// @deno-types="./pkg/deno_rusty_markdown.d.ts"
import { parse as internal_parse } from "./pkg/deno_rusty_markdown.js";

/**
 * Option object containing flags for enabling extra features that are not part
 * of the CommonMark spec.
 */
export interface Options {
  /** Enables Github flavored tables. */
  tables?: boolean;
  /**
   * Enables footnotes\[^1\].
   *
   * \[^1\]: Like this.
   */
  footnotes?: boolean;
  /** Enables strikethrough text, \~\~like this\~\~. */
  strikethrough?: boolean;
  /** Enables Github flavored task lists. */
  tasklists?: boolean;
}

/**
 * Parses the given Markdown into HTML.
 * @param {string} text - Source Markdown text
 * @param {Options} options - Extra enabled features
 * @returns {string} Parsed HTML
 */
export function parse(text: string, options: Options = {}): string {
  return internal_parse(
    text,
    (+(options.tables ?? false) << 1) +
      (+(options.footnotes ?? false) << 2) +
      (+(options.strikethrough ?? false) << 3) +
      (+(options.tasklists ?? false) << 4),
  );
}
