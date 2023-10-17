/**
 * ```jsx
 * import { Button } from "./Button.jsx";
 *
 * const vnode = (
 *   <Button onClick={() => alert("hi")}>
 *     foobar
 *   </Button>
 * );
 * console.info(vnode != null); // => true
 * ```
 */
export const Button = ({ children, ...props }) => {
  const {
    type = "button",
    ...restProps
  } = props;

  return (
    <button type={type} {...restProps}>
      {children}
    </button>
  );
};
