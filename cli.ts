import type { Runner, TestStatus } from "./_runner.ts";
import {
  createDefaultRunner,
  kTestNamePrefix,
  tryToGetStyledSourceCode,
} from "./_runner.ts";
import { run } from "./mod.ts";
import { writeAll } from "./cli.deps.ts";
import { bold, green, red } from "./deps.ts";

interface TestReporter {
  startTestSuite(name: string): Promise<void>;
  finishTestSuite(name: string, status: TestStatus): Promise<void>;
  startTestCase(name: string): Promise<void>;
  finishTestCase(name: string, status: TestStatus): Promise<void>;
  reportError(error: Error): Promise<void>;
}

function createCLIRunner(reporter: TestReporter): Runner {
  const runner = createDefaultRunner();
  return {
    async runTestCase(testCase) {
      await reporter.startTestCase(testCase.name);
      const result = await runner.runTestCase(testCase);
      if (result.status === "failed") {
        await reporter.reportError(result.error);
      }
      await reporter.finishTestCase(testCase.name, result.status);
      return result;
    },
  };
}

function createCLIReporter(stdout: Deno.Writer): TestReporter {
  const encoder = new TextEncoder();
  return {
    startTestCase: async (name) => {
      await writeAll(stdout, encoder.encode(`  ${bold(name)} ... `));
    },
    finishTestCase: async (_, status) => {
      const statusText = status === "success" ? green("OK") : red("FAILED");
      await writeAll(stdout, encoder.encode(`${statusText}\n`));
    },
    startTestSuite: async (name) => {
      await writeAll(stdout, encoder.encode(`${bold(name)} ...\n`));
    },
    finishTestSuite: async (name, status) => {
      const statusText = status === "success" ? green("OK") : red("FAILED");
      await writeAll(
        stdout,
        encoder.encode(`${bold(name)} ... ${statusText}\n`),
      );
    },
    reportError(error) {
      console.error(error);
      const code = tryToGetStyledSourceCode(error);
      if (code != null) {
        console.error(code);
      }
      return Promise.resolve();
    },
  };
}

async function main(args: Array<string>) {
  const reporter = createCLIReporter(Deno.stdout);
  const runner = createCLIRunner(reporter);
  let failed = false;
  for (const input of args) {
    const testSuiteName = `${kTestNamePrefix}${input}`;
    await reporter.startTestSuite(testSuiteName);
    const result = await run(input, { runner });
    if (result.status === "failed") {
      failed = true;
    }
    await reporter.finishTestSuite(testSuiteName, result.status);
  }

  if (failed) {
    throw new Error("Tests failed");
  }
}

main(Deno.args).catch((error) => {
  console.error();
  console.error(error);
  Deno.exit(1);
});
