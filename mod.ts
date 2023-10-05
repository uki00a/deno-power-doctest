import { parse as parseMarkdown } from "./markdown.ts";
import type { RunResult } from "./_runner.ts";
import { testCodeBlocks } from "./tester.ts";

export async function test(
  ctx: Deno.TestContext,
  path: string,
): Promise<RunResult> {
  const markdown = await Deno.readTextFile(path);
  const codeBlocks = parseMarkdown(markdown);
  const result = await testCodeBlocks(ctx, codeBlocks);
  return result;
}
