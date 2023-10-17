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
      (await Deno.readTextFile(join(baseDir, "testdata/cli.md.stdout.txt")))
        .trim();
    assertEquals(stdout, expected);
  },
  permissions: {
    read: ["testdata/cli.md.stdout.txt"],
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
      (await Deno.readTextFile(join(baseDir, "testdata/fail.md.stdout.txt")))
        .trim();
    assertEquals(stdout, expected);
    assertStringIncludes(stderr, "Error: Tests failed");
    assertStringIncludes(stderr, "AssertionError: Values are not equal.");
  },
  permissions: {
    read: ["testdata/fail.md.stdout.txt"],
    run: ["deno"],
  },
});

Deno.test({
  name: "CLI - testdata/sample.ts",
  fn: async () => {
    const output = await new Deno.Command("deno", {
      args: [
        "run",
        "--no-prompt",
        "--allow-read=.",
        "--allow-write=.",
        "cli.ts",
        "testdata/sample.ts",
      ],
      cwd: baseDir,
      env: { NO_COLOR: "1" },
    }).output();
    const stdout = decoder.decode(output.stdout).trim();
    const stderr = decoder.decode(output.stderr).trim();
    assert(output.success, stderr);

    const expected =
      (await Deno.readTextFile(join(baseDir, "testdata/sample.ts.stdout.txt")))
        .trim();
    assertEquals(stdout, expected);
  },
  permissions: {
    read: ["testdata/sample.ts.stdout.txt"],
    run: ["deno"],
  },
});

Deno.test({
  name: "CLI - testdata/fail.ts",
  fn: async () => {
    const output = await new Deno.Command("deno", {
      args: [
        "run",
        "--no-prompt",
        "--allow-read=.",
        "--allow-write=.",
        "cli.ts",
        "testdata/fail.ts",
      ],
      cwd: baseDir,
      env: { NO_COLOR: "1" },
    }).output();
    const stdout = decoder.decode(output.stdout).trim();
    const stderr = decoder.decode(output.stderr).trim();
    assert(!output.success, stderr);

    const expected =
      (await Deno.readTextFile(join(baseDir, "testdata/fail.ts.stdout.txt")))
        .trim();
    assertEquals(stdout, expected);
    assertStringIncludes(stderr, "Error: Tests failed");
    assertStringIncludes(stderr, "AssertionError: Values are not equal.");
  },
  permissions: {
    read: ["testdata/fail.ts.stdout.txt"],
    run: ["deno"],
  },
});

Deno.test({
  name: "CLI - testdata/Divider.tsx",
  fn: async () => {
    const output = await new Deno.Command("deno", {
      args: [
        "run",
        "--no-prompt",
        "--allow-read=.",
        "--allow-write=.",
        "--allow-net=esm.sh",
        "--quiet",
        "cli.ts",
        "testdata/Divider.tsx",
      ],
      cwd: baseDir,
      env: { NO_COLOR: "1" },
    }).output();
    const stdout = decoder.decode(output.stdout).trim();
    const stderr = decoder.decode(output.stderr).trim();
    assert(output.success, stderr);

    const expected = (await Deno.readTextFile(
      join(baseDir, "testdata/Divider.tsx.stdout.txt"),
    ))
      .trim();
    assertEquals(stdout, expected);
  },
  permissions: {
    read: ["testdata/Divider.tsx.stdout.txt"],
    run: ["deno"],
  },
});

Deno.test({
  name: "CLI - testdata/Button.jsx",
  fn: async () => {
    const output = await new Deno.Command("deno", {
      args: [
        "run",
        "--no-prompt",
        "--allow-read=.",
        "--allow-write=.",
        "--allow-net=esm.sh",
        "--quiet",
        "cli.ts",
        "testdata/Button.jsx",
      ],
      cwd: baseDir,
      env: { NO_COLOR: "1" },
    }).output();
    const stdout = decoder.decode(output.stdout).trim();
    const stderr = decoder.decode(output.stderr).trim();
    assert(output.success, stderr);

    const expected = (await Deno.readTextFile(
      join(baseDir, "testdata/Button.jsx.stdout.txt"),
    ))
      .trim();
    assertEquals(stdout, expected);
  },
  permissions: {
    read: ["testdata/Button.jsx.stdout.txt"],
    run: ["deno"],
  },
});
