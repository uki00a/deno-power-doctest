import { dirname, join, resolve } from "node:path";
import type { CodeBlock } from "./_code_block.ts";
import { toExtname } from "./_code_block.ts";
import { transform } from "./_transform.ts";
import { bold, brightYellow, gray, parseStackTrace, red } from "./deps.ts";
import { createProject } from "./internal/ts-morph/mod.ts";

export type TestStatus = "success" | "failed";

export interface RunResult {
  status: TestStatus;
}

export interface RunCodeBlocksOptions {
  runner: Runner;
  path?: string;
}

interface TestCase {
  path: string;
  name: string;
  mediaType: CodeBlock["mediaType"];
  code: string;
  range: CodeBlock["range"];
}

export interface Runner {
  runTestCase(testCase: TestCase): Promise<TestCaseResult>;
}

export type TestCaseResult =
  | { status: "success" }
  | { status: "failed"; error: Error };

class DynamicImportRunner implements Runner {
  async runTestCase(testCase: TestCase): Promise<TestCaseResult> {
    const filename = `.doctest${toExtname(testCase.mediaType)}`;
    const path = resolve(join(dirname(testCase.path), filename));
    const headerLine =
      "// This file is automatically generated by `deno-power-doctest`.\n// This file should not be included in the version control.\n";
    await Deno.writeTextFile(path, headerLine + testCase.code);
    try {
      const { range: { start: { line: start }, end: { line: end } } } =
        testCase;
      const url = new URL(`file://${path}?${start}-${end}`).href;
      await import(url);
      return { status: "success" };
    } catch (error) {
      embedSourceCodeInfoIntoError(error, {
        code: testCase.code,
        path: testCase.path,
      });
      return { status: "failed", error };
    }
  }
}

export function createDefaultRunner(): Runner {
  return new DynamicImportRunner();
}

export const kTestNamePrefix = "[power-doctest] ";
export async function runCodeBlocks(
  codeBlocks: Array<CodeBlock>,
  options?: RunCodeBlocksOptions,
): Promise<RunResult> {
  const project = createProject();
  const runner = options?.runner ?? new DynamicImportRunner();
  let status: TestStatus = "success";
  for (const codeBlock of codeBlocks) {
    const code = codeBlock.code;
    const extname = toExtname(codeBlock.mediaType);
    const filename = options?.path ?? `.doctest${extname}`;
    const transformedCode = transform({ code, filename, project });
    const { range } = codeBlock;
    const path = options?.path ?? join(Deno.cwd(), filename);
    const pathWithLocation = `${path}#L${range.start.line}-${range.end.line}`;
    const testCaseName = `${kTestNamePrefix}${pathWithLocation}`;
    const result = await runner.runTestCase({
      path,
      mediaType: codeBlock.mediaType,
      name: testCaseName,
      code: transformedCode,
      range,
    });
    if (result.status === "failed") {
      status = "failed";
    }
  }
  return { status };
}

const kInternalErrorEmbeddedSourceCodeInfo = Symbol(
  "deno-power-doctest.Error.sourceCodeInfo",
);

interface SourceCodeInfo {
  code: string;
  path: string;
}

export function embedSourceCodeInfoIntoError(
  error: Error,
  info: SourceCodeInfo,
): void {
  // TODO: This is not an ideal solution.
  Object.defineProperty(error, kInternalErrorEmbeddedSourceCodeInfo, {
    value: info,
    enumerable: false,
  });
}

export function tryToGetStyledSourceCode(error: Error): string | null {
  const maybeInfo: SourceCodeInfo | undefined =
    // @ts-expect-error This is an internal property
    error[kInternalErrorEmbeddedSourceCodeInfo];
  if (maybeInfo == null) {
    return null;
  }

  const frames = parseStackTrace(error)
    .filter((x: { fileName: string }) =>
      URL.canParse(x.fileName) && x.fileName.startsWith("data:")
    );

  if (frames.length !== 1) {
    return null;
  }

  const [dataURLFrame] = frames;
  const { columnNumber, lineNumber } = dataURLFrame;
  const lines = maybeInfo.code.split("\n");
  const middle = lineNumber - 1;
  const top = Math.max(1, middle - 2);
  const bottom = Math.min(middle + 3, lines.length);
  for (let i = top; i < bottom; i++) {
    const isTargetLine = i === middle;
    if (isTargetLine) {
      lines[i] = `  ${bold(red(lines[i]))}\n${(" ").repeat(columnNumber - 1)}${
        red("^")
      }`;
    } else {
      lines[i] = `  ${gray(lines[i])}`;
    }
  }
  const code = lines.slice(top, bottom).join("\n");
  const bar = red("⎯").repeat(40);
  return `${bar}\n${brightYellow(bold(maybeInfo.path))}:\n${code}\n${bar}`;
}
