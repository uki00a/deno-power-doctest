import {
  bold,
  brightYellow,
  encodeToBase64,
  gray,
  parseStackTrace,
  red,
} from "./deps.ts";
import { createProject, transform } from "./_transform.ts";
import { toExtname, toMimeType } from "./_code_block.ts";
import { parse as parseMarkdown } from "./markdown.ts";

export type TestContext = Deno.TestContext;

type TestStatus = "success" | "failed";

interface TestResult {
  status: TestStatus;
}

interface TestOptions {
  failFast?: boolean;
  reporter?: TestReporter;
}

export interface TestReporter {
  startTestSuite(name: string): Promise<void>;
  finishTestSuite(name: string, status: TestStatus): Promise<void>;
  startTestCase(name: string): Promise<void>;
  finishTestCase(name: string, status: TestStatus): Promise<void>;
}

interface SourceCodeInfo {
  code: string;
  path: string;
}

const kTestNamePrefix = "[power-doctest] ";
export async function test(
  ctx: TestContext,
  path: string,
  options?: TestOptions,
): Promise<TestResult> {
  const markdown = await Deno.readTextFile(path);
  const { reporter } = options ?? {};
  const project = createProject();
  const codeBlocks = parseMarkdown(markdown);

  const testSuiteName = `${kTestNamePrefix}${path}`;
  await reporter?.startTestSuite(testSuiteName);
  let status: TestResult["status"] = "success";
  for (const codeBlock of codeBlocks) {
    const code = codeBlock.code;
    const filename = `${crypto.randomUUID()}${toExtname(codeBlock.mediaType)}`;
    const transformedCode = transform({ code, filename, project });
    const mimeType = toMimeType(codeBlock.mediaType);
    const dataURL = `data:${mimeType};base64,${
      encodeToBase64(transformedCode)
    }`;

    const { range } = codeBlock;
    const pathWithLocation = `${path}#L${range.start.line}-${range.end.line}`;
    const testCaseName = `${kTestNamePrefix}${pathWithLocation}`;
    const pass = await ctx.step(testCaseName, async () => {
      await reporter?.startTestCase(testCaseName);
      try {
        await import(dataURL);
      } catch (error) {
        embedSourceCodeInfoIntoError(error, {
          code: transformedCode,
          path: pathWithLocation,
        });
        throw error;
      }
    });
    await reporter?.finishTestCase(testCaseName, pass ? "success" : "failed");
    if (!pass) {
      status = "failed";
    }
  }
  await reporter?.finishTestSuite(testSuiteName, status);
  return { status };
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

  if (frames.length === 1) {
    const [dataURLFrame] = frames;
    const { columnNumber, lineNumber } = dataURLFrame;
    const lines = maybeInfo.code.split("\n");
    const middle = lineNumber - 1;
    const top = Math.max(1, middle - 2);
    const bottom = Math.min(middle + 3, lines.length);
    for (let i = top; i < bottom; i++) {
      const isTargetLine = i === middle;
      if (isTargetLine) {
        lines[i] = `  ${bold(red(lines[i]))}\n
  ${(" ").repeat(columnNumber - 1)}${red("^")}`;
      } else {
        lines[i] = `  ${gray(lines[i])}`;
      }
    }
    const code = lines.slice(top, bottom).join("\n");
    const bar = red("⎯").repeat(40);
    return `${bar}\n${brightYellow(bold(maybeInfo.path))}:\n${code}\n${bar}`;
  }
  return null;
}

const kInternalErrorEmbeddedSourceCodeInfo = Symbol(
  "deno-power-doctest.Error.sourceCodeInfo",
);
