import { join } from "node:path";
import { assertEquals } from "./deps.ts";

Deno.test({
  name: "CLI",
  fn: async () => {
    const decoder = new TextDecoder();
    const baseDir = new URL("./", import.meta.url).pathname;
    const output = await new Deno.Command("deno", {
      args: [
        "run",
        "--no-prompt",
        "--allow-read=testdata/cli.md",
        "cli.ts",
        "testdata/cli.md",
      ],
      cwd: baseDir,
      env: { NO_COLOR: "1" },
    }).output();
    const stderr = decoder.decode(output.stderr);
    assertEquals(output.success, true, stderr);

    const stdout = decoder.decode(output.stdout).trim();
    const expected =
      (await Deno.readTextFile(join(baseDir, "testdata/cli.output.txt")))
        .trim();
    assertEquals(stdout, expected);
  },
  permissions: {
    read: ["testdata/cli.output.txt"],
    run: ["deno"],
  },
});
