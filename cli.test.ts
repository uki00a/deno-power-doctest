import { join } from "node:path";
import { assert, assertEquals } from "./deps.ts";
import { assertStringIncludes } from "./test.deps.ts";

const decoder = new TextDecoder();
const baseDir = new URL("./", import.meta.url).pathname;

Deno.test({
  name: "CLI - testdata/cli.md",
  fn: async () => {
    const output = await new Deno.Command("deno", {
      args: [
        "run",
        "--no-prompt",
        "--allow-read=.",
        "--allow-write=.",
        "cli.ts",
        "testdata/cli.md",
      ],
      cwd: baseDir,
      env: { NO_COLOR: "1" },
    }).output();
    const stderr = decoder.decode(output.stderr);
    assert(output.success, stderr);

    const stdout = decoder.decode(output.stdout).trim();
    const expected =
      (await Deno.readTextFile(join(baseDir, "testdata/cli.stdout.txt")))
        .trim();
    assertEquals(stdout, expected);
  },
  permissions: {
    read: ["testdata/cli.stdout.txt"],
    run: ["deno"],
  },
});

Deno.test({
  name: "CLI - testdata/fail.md",
  fn: async () => {
    const output = await new Deno.Command("deno", {
      args: [
        "run",
        "--no-prompt",
        "--allow-read=.",
        "--allow-write=.",
        "cli.ts",
        "testdata/fail.md",
      ],
      cwd: baseDir,
      env: { NO_COLOR: "1" },
    }).output();
    const stdout = decoder.decode(output.stdout).trim();
    const stderr = decoder.decode(output.stderr).trim();
    assert(!output.success, stderr);

    const expected =
      (await Deno.readTextFile(join(baseDir, "testdata/fail.stdout.txt")))
        .trim();
    assertEquals(stdout, expected);
    assertStringIncludes(stderr, "Error: Tests failed");
  },
  permissions: {
    read: ["testdata/fail.stdout.txt"],
    run: ["deno"],
  },
});
