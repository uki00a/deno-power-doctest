# deno-power-doctest

Deno port of [power-doctest](https://github.com/azu/power-doctest).

## Examples

```typescript
const n: number = 123;
console.log(n); // => 123
console.log(n + 1); // => 124
console.log("foo"); // => "foo"
console.log({ n: 1, s: "bar" }); // => { n: 1, s: "bar" }
```

```typescript
import { test } from "https://deno.land/x/deno_power_doctest@$MODULE_VERSION/mod.ts";

Deno.test({
  name: "test",
  fn: async (t) => {
    await test(t, "README.md");
  },
  permissions: {
    read: ["."],
    write: [".doctest.ts"],
  },
});
```

## Prior works

- [power-doctest](https://github.com/azu/power-doctest)
- [rust-skeptic](https://github.com/budziq/rust-skeptic)
- [doctest](https://docs.python.org/3/library/doctest.html)
- [Godoc examples](https://go.dev/blog/examples)
