import type { CodeBlock } from "./_code_block.ts";
import type {
  RunCodeBlocksOptions,
  Runner,
  TestCaseResult,
} from "./_runner.ts";
import { createDefaultRunner, runCodeBlocks } from "./_runner.ts";

type TestCodeBlocksOptions = Omit<RunCodeBlocksOptions, "runner">;

function createTestRunner(t: Deno.TestContext, runner: Runner): Runner {
  return {
    async runTestCase(testCase) {
      let result: TestCaseResult | undefined;
      await t.step(testCase.name, async () => {
        result = await runner.runTestCase(testCase);
        if (result.status === "failed") {
          throw result.error;
        }
      });
      return result ??
        { status: "failed", error: new Error("Unexpected error") };
    },
  };
}

export async function testCodeBlocks(
  t: Deno.TestContext,
  codeBlocks: Array<CodeBlock>,
  options?: TestCodeBlocksOptions,
) {
  const runner = createTestRunner(t, createDefaultRunner());
  const result = await runCodeBlocks(codeBlocks, {
    ...options,
    runner,
  });
  return result;
}
