import { createProject, withSourceFile } from "./internal/ts-morph/mod.ts";
import type { CodeBlock } from "./_code_block.ts";
import { parse as parseMarkdown } from "./markdown.ts";
import type {
  JSDocLink,
  JSDocLinkCode,
  JSDocLinkPlain,
  JSDocText,
} from "./deps.ts";
import { Node, ts } from "./deps.ts";

export function parse(content: string): Array<CodeBlock> {
  const project = createProject();
  return withSourceFile(
    (sourceFile) => {
      const foundBlocks: Array<CodeBlock> = [];
      sourceFile.forEachDescendant((node) => {
        if (!Node.isJSDocable(node)) return;

        for (const x of node.getJsDocs()) {
          const comment = x.getComment();
          if (comment == null) continue;

          const origStartLine = x.getStartLineNumber();
          const body = typeof comment === "string"
            ? comment
            : comment.map(getJSDocBody).join("");
          const blocks = parseMarkdown(body).map(({ range, ...x }) => {
            return {
              ...x,
              range: {
                start: {
                  ...range.start,
                  line: origStartLine + range.start.line,
                },
                end: {
                  ...range.end,
                  line: origStartLine + range.end.line,
                },
              },
            };
          });
          foundBlocks.push(...blocks);
        }
      });
      return foundBlocks;
    },
    project,
    "tmp.ts",
    content,
  );
}

function getJSDocBody(
  jsdoc: JSDocText | JSDocLink | JSDocLinkCode | JSDocLinkPlain | undefined,
) {
  if (jsdoc == null) {
    return "";
  }
  if (jsdoc.isKind(ts.SyntaxKind.JSDocText)) {
    // NOTE: `JSDocText#getText()` returns a comment with preceding `/*` or `*`.
    return jsdoc.compilerNode.text;
  } else {
    return jsdoc.getText();
  }
}
