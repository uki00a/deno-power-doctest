import { createProject, withSourceFile } from "./internal/ts-morph/mod.ts";
import type { CodeBlock } from "./_code_block.ts";
import { parse as parseMarkdown } from "./markdown.ts";
import { Node } from "./deps.ts";

export function parse(content: string): Array<CodeBlock> {
  const project = createProject();
  return withSourceFile(
    (sourceFile) => {
      return sourceFile.getStatementsWithComments()
        .flatMap((stmt) => {
          if (!Node.isJSDocable(stmt)) return [];

          return stmt.getJsDocs().flatMap((x) => {
            const { comment } = x.compilerNode;
            if (comment == null) return [];

            const origStartLine = x.getStartLineNumber();
            if (typeof comment === "string") {
              return parseMarkdown(comment).map(({ range, ...x }) => {
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
            } else {throw new Error(
                "`ts.NodeArray<ts.JSDocComment>` is not supported yet.",
              );}
          });
        });
    },
    project,
    "tmp.ts",
    content,
  );
}
