import { assertEquals } from "./deps.ts";
import { parse } from "./typescript.ts";

const sampleFileURL = new URL(import.meta.resolve("./testdata/sample.ts"));
Deno.test({
  name: "parse",
  permissions: { read: [sampleFileURL] },
  fn: async () => {
    const source = await Deno.readTextFile(sampleFileURL);
    const actual = parse(source);

    const expected = [
      {
        code: `import { add } from "./sample.ts";
console.log(add(1, 2)); // => 3
console.log(add(4, 5)); // => 9`,
        mediaType: "typescript" as const,
        range: {
          start: { line: 2, column: 1 },
          end: { line: 6, column: 4 },
        },
      },
      {
        code: `import { mul } from "./sample.ts";
console.info(mul(2, 3)); // => 6`,
        mediaType: "typescript" as const,
        range: {
          start: { line: 21, column: 1 },
          end: { line: 24, column: 4 },
        },
      },
      {
        code: `import { mul } from "./sample.ts";
console.log(mul(4, 5)); // => 20`,
        mediaType: "javascript" as const,
        range: {
          start: { line: 26, column: 1 },
          end: { line: 29, column: 4 },
        },
      },
      {
        code: `import { div } from "./sample.ts";
console.log(div(10, 2)); // => 5`,
        mediaType: "typescript" as const,
        range: {
          start: { line: 37, column: 1 },
          end: { line: 40, column: 4 },
        },
      },
    ];
    assertEquals(actual, expected);
  },
});
