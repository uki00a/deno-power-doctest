import type { TestContext, TestReporter } from "./mod.ts";
import { test, tryToGetStyledSourceCode } from "./mod.ts";
import { writeAll } from "./cli.deps.ts";
import { bold, green, red } from "./deps.ts";

function createTestContextForCLI(
  name: string,
  origin: string,
): TestContext {
  async function step(
    descriptionOrDefinitionOrFn:
      | string
      | Deno.TestDefinition
      | Deno.TestDefinition["fn"],
    maybeFn?: Deno.TestDefinition["fn"],
  ) {
    const definition: Deno.TestStepDefinition =
      typeof descriptionOrDefinitionOrFn === "string"
        ? { name: descriptionOrDefinitionOrFn, fn: maybeFn ?? (() => {}) }
        : (typeof descriptionOrDefinitionOrFn === "function")
        ? {
          fn: descriptionOrDefinitionOrFn,
          name: descriptionOrDefinitionOrFn.name,
        }
        : descriptionOrDefinitionOrFn;
    if (definition.ignore) {
      return true;
    }

    try {
      await definition.fn(createTestContextForCLI(definition.name, origin));
      return true;
    } catch (error) {
      console.error(error);
      if (error != null) {
        const code = tryToGetStyledSourceCode(error);
        if (code != null) {
          console.error(code);
        }
      }
      return false;
    }
  }

  const ctx: TestContext = {
    name,
    origin,
    step,
  };
  return ctx;
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
  };
}

async function main(args: Array<string>) {
  let failed = false;
  for (const input of args) {
    const ctx = createTestContextForCLI(input, input);
    const reporter = createCLIReporter(Deno.stdout);
    const { status } = await test(ctx, input, { reporter });
    if (status === "failed") {
      failed = true;
    }
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
