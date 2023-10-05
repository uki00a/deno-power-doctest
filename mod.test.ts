import { test } from "./mod.ts";

Deno.test({
  name: "test()",
  fn: async (t) => {
    await test(t, "README.md");
  },
  permissions: {
    read: ["."],
    write: ["."],
  },
});
