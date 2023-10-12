/**
 * ```ts
 * import { add } from "./sample.ts";
 * console.log(add(1, 2)); // => 3
 * console.log(add(4, 5)); // => 9
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtracts `b` from `a`
 */
export function sub(a: number, b: number): number {
  return a - b;
}

/**
 * Multiplies `a` by `b`
 * ```ts
 * import { mul } from "./sample.ts";
 * console.info(mul(2, 3)); // => 6
 * ```
 *
 * ```js
 * import { mul } from "./sample.ts";
 * console.log(mul(4, 5)); // => 20
 * ```
 */
export function mul(a: number, b: number): number {
  return a * b;
}

/**
 * Divides `a` by `b`
 * ```ts
 * import { div } from "./sample.ts";
 * console.log(div(10, 2)); // => 5
 * ```
 */
export function div(a: number, b: number): number {
  return a / b;
}

function noop(): void {}
