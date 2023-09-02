import assert from "node:assert";
import { remarkParse, selectAll, unified } from "./markdown.deps.ts";

import type { CodeBlock } from "./_code_block.ts";

// TODO: Support tsx/jsx
const languages = ["ts", "typescript", "js", "javascript"] as const;
type SupportedLanguage = typeof languages[number];

function toMimeType(language: SupportedLanguage): CodeBlock["mediaType"] {
  switch (language) {
    case "ts":
    case "typescript":
      return "typescript";
    case "js":
    case "javascript":
      return "javascript";
  }
}

export function parse(content: string): Array<CodeBlock> {
  const tree = unified().use(remarkParse).parse(content);
  const codeBlocks = languages.flatMap((language) =>
    selectAll(`code[lang="${language}"]`, tree)
  ).sort((a, b) =>
    (a.position?.start.line ?? 0) - (b.position?.start.line ?? 0)
  );
  return codeBlocks.map((x) => {
    const { position } = x;
    assert(position, "`position` should exist");
    return {
      // @ts-expect-error TODO: fix this type error.
      code: codeBlock.value,
      // @ts-expect-error TODO: fix this type error.
      mediaType: toMimeType(x.lang),
      range: {
        start: { line: position.start.line, column: position.start.column },
        end: { line: position.end.line, column: position.end.column },
      },
    };
  });
}
