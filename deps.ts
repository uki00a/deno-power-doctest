/**
 * {@link https://github.com/remarkjs/remark/tree/remark-parse%4010.0.2/packages/remark-parse}
 */
export { default as remarkParse } from "https://esm.sh/remark-parse@10.0.2?pin=v131&deps=unified@10.1.2";

/**
 * {@link https://github.com/unifiedjs/unified}
 */
export { unified } from "https://esm.sh/unified@10.1.2?pin=v131";

/**
 * {@link https://github.com/syntax-tree/unist-util-select}
 */
export { selectAll } from "https://esm.sh/unist-util-select@5.0.0?pin=v131";

/**
 * {@link https://github.com/felixge/node-stack-trace}
 */
export { parse as parseStackTrace } from "https://esm.sh/stack-trace@1.0.0-pre2?pin=v131&no-dts";

/**
 * {@link https://github.com/dsherret/ts-morph}
 */
export { Project, ts } from "https://deno.land/x/ts_morph@19.0.0/mod.ts";
export type {
  CallExpression,
  SourceFile,
} from "https://deno.land/x/ts_morph@19.0.0/mod.ts";

export const kStdAssertModURL =
  "https://deno.land/std@0.200.0/assert/assert.ts";
export const kStdAssertEqualsModURL =
  "https://deno.land/std@0.200.0/assert/assert_equals.ts";
export { assert } from "https://deno.land/std@0.200.0/assert/assert.ts";
export { assertEquals } from "https://deno.land/std@0.200.0/assert/assert_equals.ts";
export { AssertionError } from "https://deno.land/std@0.200.0/assert/assertion_error.ts";

export {
  decode as decodeFromBase64,
  encode as encodeToBase64,
} from "https://deno.land/std@0.200.0/encoding/base64.ts";

export {
  bold,
  brightYellow,
  gray,
  green,
  red,
} from "https://deno.land/std@0.200.0/fmt/colors.ts";
