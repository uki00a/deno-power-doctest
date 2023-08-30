import assert from "node:assert";
import type { CallExpression, SourceFile } from "./deps.ts";
import {
  kStdAssertEqualsModURL,
  kStdAssertModURL,
  Project,
  ts,
} from "./deps.ts";

const kConsole = "console";
const kConsoleMethods = [
  "log",
  "info",
  "error",
  "debug",
  "warn",
  "assert",
  // TODO: Support `console.table`
  // "table",
] as const;
type ConsoleMethod = typeof kConsoleMethods[number];

const kAssertPrefix = "_power_doctest_";
const kAssert = `${kAssertPrefix}assert`;
const kAssertEquals = `${kAssertPrefix}assertEquals`;
const kTestFileHeader =
  `import { assert as ${kAssert} } from "${kStdAssertModURL}";
import { assertEquals as ${kAssertEquals} } from "${kStdAssertEqualsModURL}";\n`;

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
    const transformed = transformSourceFile(sourceFile);
    return transformed;
  } finally {
    project.removeSourceFile(sourceFile);
  }
}

function transformSourceFile(sourceFile: SourceFile): string {
  let shouldInjectTestFileHeader = false;
  sourceFile.forEachDescendant((node, traversal) => {
    if (node.getKind() !== ts.SyntaxKind.CallExpression) {
      return;
    }

    assert(node.isKind(ts.SyntaxKind.CallExpression));
    const maybeConsoleMethod = tryToGetConsoleMethod(node);
    if (!maybeConsoleMethod) return traversal.skip();

    const assertionExpr =
      tryToTransformConsoleCallExpressionToAssertionExpression(
        node,
        maybeConsoleMethod,
      );
    if (assertionExpr == null) return traversal.skip();

    node.replaceWithText(assertionExpr);
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
}

function tryToTransformConsoleCallExpressionToAssertionExpression(
  callExpr: CallExpression,
  method: ConsoleMethod,
): string | null {
  const args = callExpr.getArguments();
  if (args.length !== 1) return null;

  if (method === "assert") {
    return `${kAssert}(${args[0].getText()})`;
  } else {
    const trailingCommentRanges = callExpr.getParent()
      ?.getTrailingCommentRanges();
    const hasNoTrailingComments = trailingCommentRanges == null ||
      trailingCommentRanges.length === 0;
    if (hasNoTrailingComments) {
      return null;
    }

    const trailingComment = trailingCommentRanges[0].getText();
    // TODO: Support multiline comments
    if (
      !trailingComment.startsWith("//")
    ) {
      return null;
    }
    const commentBody = trailingComment.slice("//".length).trim();
    if (!commentBody.startsWith("=>")) return null;

    const expectedValue = commentBody.slice("=>".length).trim();

    return `${kAssertEquals}(${args[0].getText()}, ${expectedValue})`;
  }
}

function tryToGetConsoleMethod(node: CallExpression): ConsoleMethod | null {
  const expr = node.getExpressionIfKind(ts.SyntaxKind.PropertyAccessExpression);
  if (expr == null) return null;

  const ident = expr.getExpressionIfKind(ts.SyntaxKind.Identifier);
  if (ident == null) return null;
  if (ident.getText() !== kConsole) return null;

  const methodName = expr.getNameNode().getText();
  if (!isConsoleMethod(methodName)) return null;
  return methodName;
}

function isConsoleMethod(methodName: string): methodName is ConsoleMethod {
  return kConsoleMethods.includes(methodName as ConsoleMethod);
}
