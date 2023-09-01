import {
  assertEquals,
  kStdAssertEqualsModURL,
  kStdAssertModURL,
} from "./deps.ts";
import { createProject, transform } from "./_transform.ts";

const kAssert = "_power_doctest_assert";
const kAssertEquals = "_power_doctest_assertEquals";
const kTestFileHeader =
  `import { assert as ${kAssert} } from "${kStdAssertModURL}";
import { assertEquals as ${kAssertEquals} } from "${kStdAssertEqualsModURL}";`;

Deno.test("transform", async (t) => {
  const project = createProject();
  for (
    const { given, expected, description } of [
      {
        description: "Simple",
        given: `const n: number = 123;
console.log(n); // => 123
console.info("foo"); // => "foo"
console.error(n + 45); //  =>  123 + 44 + 1
console.warn("ba" + "r");  // => "bar" 
console.debug(1n); // => 1n

console.log([1, "baz"]); // => [1, "baz"]
console.info({ name: "bar", id: 1 }); // => { id: 1, name: "bar" }

console.log(456); // -> 456`,
        expected: `${kTestFileHeader}
const n: number = 123;
${kAssertEquals}(n, 123); // => 123
${kAssertEquals}("foo", "foo"); // => "foo"
${kAssertEquals}(n + 45, 123 + 44 + 1); //  =>  123 + 44 + 1
${kAssertEquals}("ba" + "r", "bar");  // => "bar" 
${kAssertEquals}(1n, 1n); // => 1n

${kAssertEquals}([1, "baz"], [1, "baz"]); // => [1, "baz"]
${kAssertEquals}({ name: "bar", id: 1 }, { id: 1, name: "bar" }); // => { id: 1, name: "bar" }

console.log(456); // -> 456`,
      },
      {
        description: "console.assert",
        given: `console.assert(1 + 2 === 3);
console.assert("foo" === "fo" + "o"); // => true`,
        expected: `${kTestFileHeader}
${kAssert}(1 + 2 === 3);
${kAssert}("foo" === "fo" + "o"); // => true`,
      },
      {
        description:
          "handle an assertion comment that appears on the next line",
        given: `console.log("hello");
// => "hello"`,
        expected: `${kTestFileHeader}
${kAssertEquals}("hello", "hello");
// => "hello"`,
      },
    ]
  ) {
    await t.step({
      name: description,
      fn: () =>
        assertEquals(
          transform({
            code: given,
            filename: `${description}.ts`,
            project,
          }),
          expected,
        ),
    });
  }
});
