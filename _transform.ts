import assert from "node:assert";
import type { CallExpression, SourceFile } from "./deps.ts";
import {
  kStdAssertEqualsModURL,
  kStdAssertModURL,
  Project,
  ts,
} from "./deps.ts";
import { withSourceFile } from "./internal/ts-morph/mod.ts";

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
  return withSourceFile(transformSourceFile, project, filename, code);
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
    const assertionCommentExpr = tryToGetAssertionCommentExpression(callExpr);
    if (
      assertionCommentExpr == null
    ) {
      return null;
    }
    return `${kAssertEquals}(${args[0].getText()}, ${assertionCommentExpr})`;
  }
}

function tryToGetAssertionCommentExpression(
  callExpr: CallExpression,
): string | null {
  const callExprStmt = callExpr.getParent();
  assert(callExprStmt?.isKind(ts.SyntaxKind.ExpressionStatement));
  const trailingCommentRanges = callExprStmt.getTrailingCommentRanges();
  const hasNoTrailingComments = trailingCommentRanges == null ||
    trailingCommentRanges.length === 0;
  if (hasNoTrailingComments) {
    const maybeSingleLineComment = callExprStmt.getNextSiblingIfKind(
      ts.SyntaxKind.SingleLineCommentTrivia,
    );
    if (maybeSingleLineComment == null) {
      return null;
    }
    return tryToParseAssertionComment(maybeSingleLineComment.getText());
  }

  const assertionComment = trailingCommentRanges[0].getText();
  return tryToParseAssertionComment(assertionComment);
}

function tryToParseAssertionComment(assertionComment: string): string | null {
  // TODO: Support multiline comments
  if (
    !assertionComment.startsWith("//")
  ) {
    return null;
  }

  const commentBody = assertionComment.slice("//".length).trim();
  if (!commentBody.startsWith("=>")) return null;

  const expectedValue = commentBody.slice("=>".length).trim();
  return expectedValue;
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
