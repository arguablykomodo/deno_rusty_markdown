// @deno-types="./pkg/deno_rusty_markdown.d.ts"
import { parse as internalParse } from "./pkg/deno_rusty_markdown.js";
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";

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
  /** Enables parsing of YAML frontmatter */
  frontmatter?: boolean;
  /** Enables smart punctuation (turns -- into –) */
  smartPunctuation?: boolean;
}

/**
 * Parses the YAML frontmatter (if any) of the given text.
 *
 * @param text - Input with frontmatter
 * @returns Parsed frontmatter and remaining text
 */
function getFrontmatter(text: string): { frontmatter: any; text: string } {
  if (text.indexOf("---") === 0) {
    const end = text.indexOf("---", 3);
    if (end !== -1) {
      const yaml = text.slice(3, end);
      const frontmatter = yamlParse(yaml);
      return { frontmatter, text: text.slice(end + 3) };
    }
  }
  return { frontmatter: {}, text };
}

/**
 * Encodes options to pass them to WebAssembly
 *
 * @param options - Options to encode
 * @returns Encoded options
 */
function encodeOptions(options: Options): number {
  return (+(options.tables ?? false) << 1) +
    (+(options.footnotes ?? false) << 2) +
    (+(options.strikethrough ?? false) << 3) +
    (+(options.tasklists ?? false) << 4) +
    (+(options.smartPunctuation ?? false) << 5);
}

/**
 * Parses the given Markdown into HTML.
 *
 * @param text - Source Markdown text
 * @param options - Extra enabled features
 * @returns Parsed HTML
 */
export function parse(
  text: string,
  options: Options = {},
): { frontmatter?: any; parsed: string } {
  if (options.frontmatter ?? false) {
    const { frontmatter, text: remainingText } = getFrontmatter(text);
    return {
      frontmatter,
      parsed: internalParse(remainingText, encodeOptions(options)),
    };
  } else return { parsed: internalParse(text, encodeOptions(options)) };
}
