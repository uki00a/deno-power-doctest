import assert from "node:assert";
import type { CallExpression } from "./deps.ts";
import { kStdAssertEqualsModURL, Project, ts } from "./deps.ts";

const kConsole = "console";
const kConsoleMethods = [
  "log",
  "info",
  "error",
  "debug",
  "warn",
  // TODO: Support `console.table`
  // "table",

  // TODO: Support `console.assert`
  // "assert",
];

const kAssertEquals = "_power_doctest_assertEquals";
const kTestFileHeader =
  `import { assertEquals as ${kAssertEquals} } from "${kStdAssertEqualsModURL}";\n`;

function isConsoleExpression(node: CallExpression): boolean {
  const expr = node.getExpressionIfKind(ts.SyntaxKind.PropertyAccessExpression);
  if (expr == null) return false;

  const ident = expr.getExpressionIfKind(ts.SyntaxKind.Identifier);
  if (ident == null) return false;
  if (ident.getText() !== kConsole) return false;
  if (!kConsoleMethods.includes(expr.getNameNode().getText())) return false;
  return true;
}

export function createProject(): Project {
  return new Project({
    useInMemoryFileSystem: true,
  });
}

interface TransformOptions {
  code: string;
  filename: string;
  project: Project;
}

export function transform(
  {
    code,
    filename,
    project,
  }: TransformOptions,
): string {
  const sourceFile = project.createSourceFile(filename, code);
  try {
    let shouldInjectTestFileHeader = false;
    sourceFile.forEachDescendant((node, traversal) => {
      if (node.getKind() !== ts.SyntaxKind.CallExpression) {
        return;
      }

      assert(node.isKind(ts.SyntaxKind.CallExpression));
      if (!isConsoleExpression(node)) return traversal.skip();

      const args = node.getArguments();
      if (args.length !== 1) return traversal.skip();

      const trailingCommentRanges = node.getParent()
        ?.getTrailingCommentRanges();
      if (trailingCommentRanges == null || trailingCommentRanges.length === 0) {
        return traversal.skip();
      }

      const trailingComment = trailingCommentRanges[0].getText();
      // TODO: Support multiline comments
      if (
        !trailingComment.startsWith("//")
      ) {
        return traversal.skip();
      }
      const commentBody = trailingComment.slice("//".length).trim();
      if (!commentBody.startsWith("=>")) return traversal.skip();

      const expectedValue = commentBody.slice("=>".length).trim();

      node.replaceWithText(
        `${kAssertEquals}(${args[0].getText()}, ${expectedValue})`,
      );
      shouldInjectTestFileHeader = true;
    });
    if (shouldInjectTestFileHeader) {
      sourceFile.insertText(
        0,
        kTestFileHeader,
      );
    }
    const transformed = sourceFile.getFullText();
    return transformed;
  } finally {
    project.removeSourceFile(sourceFile);
  }
}
