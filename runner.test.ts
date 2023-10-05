import { runCodeBlocks } from "./runner.ts";
import { parse as parseMarkdown } from "./markdown.ts";

// The purpose of the following code is to execute the test cases defined by `Deno.test` in `README.md`.
const readmeContent = await Deno.readTextFile(
  new URL(import.meta.resolve("./README.md")).pathname,
);
const codeBlocks = parseMarkdown(readmeContent);
await runCodeBlocks(codeBlocks);
