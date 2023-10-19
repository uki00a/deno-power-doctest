import { assertEquals } from "./deps.ts";
import { parse } from "./typescript.ts";

const sampleFileURL = new URL(import.meta.resolve("./testdata/sample.ts"));
Deno.test({
  name: "parse",
  permissions: { read: [sampleFileURL] },
  fn: async (t) => {
    await t.step("basic", async () => {
      const source = await Deno.readTextFile(sampleFileURL);
      const actual = parse(source);

      const expected = [
        {
          code: `import { add, sub } from "./sample.ts";

console.log(add(sub(5, 4), 2)); // => 3`,
          mediaType: "typescript" as const,
          range: {
            start: { line: 2, column: 1 },
            end: { line: 6, column: 4 },
          },
        },
        {
          code: `import { add } from "./sample.ts";
console.log(add(1, 2)); // => 3
console.log(add(4, 5)); // => 9`,
          mediaType: "typescript" as const,
          range: {
            start: { line: 11, column: 1 },
            end: { line: 15, column: 4 },
          },
        },
        {
          code: `import { mul } from "./sample.ts";
console.info(mul(2, 3)); // => 6`,
          mediaType: "typescript" as const,
          range: {
            start: { line: 30, column: 1 },
            end: { line: 33, column: 4 },
          },
        },
        {
          code: `import { mul } from "./sample.ts";
console.log(mul(4, 5)); // => 20`,
          mediaType: "javascript" as const,
          range: {
            start: { line: 35, column: 1 },
            end: { line: 38, column: 4 },
          },
        },
        {
          code: `import { div } from "./sample.ts";
console.log(div(10, 2)); // => 5`,
          mediaType: "typescript" as const,
          range: {
            start: { line: 46, column: 1 },
            end: { line: 49, column: 4 },
          },
        },
      ];
      assertEquals(actual, expected);
    });

    await t.step("`ts.NodeArray<ts.JSDocComment>`", () => {
      const input = `export interface Context {
  /**
   * A {@linkcode Request} object.
   */
  request: Request;
  /**
   * Returns a {@linkcode Response} object.
   * \`\`\`ts
   * const ctx: Context = {
   *   request: new Request("http://localhost:8000/"),
   *   next: () => Promise.resolve(new Response("OK")),
   * };
   * const response = await ctx.next();
   * console.info(await response.text()); // => "OK"
   * \`\`\`
   */
  next(): Promise<Response>;
}`;
      const actual = parse(input);
      const expected = [
        {
          code: `const ctx: Context = {
  request: new Request("http://localhost:8000/"),
  next: () => Promise.resolve(new Response("OK")),
};
const response = await ctx.next();
console.info(await response.text()); // => "OK"`,
          mediaType: "typescript" as const,
          range: {
            start: { line: 8, column: 1 },
            end: { line: 15, column: 4 },
          },
        },
      ];
      assertEquals(actual, expected);
    });
  },
});
