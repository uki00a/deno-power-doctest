import type { CodeBlock } from "./_code_block.ts";
import type { RunCodeBlocksOptions as BaseRunCodeBlockOptions } from "./_runner.ts";
import {
  createDefaultRunner,
  runCodeBlocks as _runCodeBlocks,
} from "./_runner.ts";

type RunCodeBlocksOptions = Omit<BaseRunCodeBlockOptions, "runner">;

export function runCodeBlocks(
  codeBlocks: Array<CodeBlock>,
  options?: RunCodeBlocksOptions,
) {
  const runner = createDefaultRunner();
  return _runCodeBlocks(codeBlocks, { ...options, runner });
}
