import { parse } from "./markdown.ts";
import { assertEquals } from "./deps.ts";

const testdataPath = new URL(import.meta.resolve("./testdata/parse.md"));
Deno.test({
  name: "parse",
  permissions: {
    read: [testdataPath],
  },
  fn: async () => {
    const md = await Deno.readTextFile(testdataPath);
    const actual = parse(md);
    const expected = [
      {
        code: `const n: number = 123;`,
        mediaType: "typescript",
        range: {
          start: { line: 3, column: 1 },
          end: { line: 5, column: 4 },
        },
      },
      {
        code: `const s = "foobar";
const o = { s };`,
        mediaType: "javascript",
        range: {
          start: { line: 7, column: 1 },
          end: { line: 10, column: 4 },
        },
      },
      {
        code: `const d = new Date();
const a = [
  1,
  "a",
];`,
        mediaType: "typescript",
        range: {
          start: { line: 12, column: 1 },
          end: { line: 18, column: 4 },
        },
      },
      {
        code: `let b = 123n;`,
        mediaType: "javascript",
        range: {
          start: { line: 20, column: 1 },
          end: { line: 22, column: 4 },
        },
      },
      {
        code: `const foo = "bar";
const vnode = (
  <div>
    {foo}
  </div>
);`,
        mediaType: "tsx",
        range: {
          start: { line: 24, column: 1 },
          end: { line: 31, column: 4 },
        },
      },
      {
        code: `const n = 12345;
const vnode = <div>{n}</div>;`,
        mediaType: "jsx",
        range: {
          start: { line: 33, column: 1 },
          end: { line: 36, column: 4 },
        },
      },
    ];
    assertEquals(actual, expected);
  },
});
