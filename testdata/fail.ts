/**
 * ```ts
 * import { identity } from "./fail.ts";
 * // This should fail.
 * console.info(identity("foo")); // => "bar"
 * ```
 */
export function identity<T>(x: T): T {
  return x;
}
