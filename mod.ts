import type { RunResult } from "./_runner.ts";
import { testCodeBlocks } from "./tester.ts";
import { chooseParserFromPath } from "./_parser.ts";

export async function test(
  ctx: Deno.TestContext,
  path: string,
): Promise<RunResult> {
  const content = await Deno.readTextFile(path);
  const parser = chooseParserFromPath(path);
  const codeBlocks = parser(content);
  const result = await testCodeBlocks(ctx, codeBlocks, { path });
  return result;
}
