import { extname } from "node:path";
import { parse as parseMarkdown } from "./markdown.ts";
import { parse as parseTypeScript } from "./typescript.ts";
import type { CodeBlock } from "./_code_block.ts";

interface Parser {
  (content: string): Array<CodeBlock>;
}

export function chooseParserFromPath(path: string): Parser {
  switch (extname(path)) {
    case ".md":
      return parseMarkdown;
    case ".ts":
    case ".js":
      return parseTypeScript;
    default:
      throw new Error(
        "`${extname(path)}` format is currently not supported yet.",
      );
  }
}
