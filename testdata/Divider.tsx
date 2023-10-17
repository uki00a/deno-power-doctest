interface Props {
  vertical?: boolean;
}

/**
 * ```tsx
 * import { Divider } from "./Divider.tsx";
 *
 * const vnode = <Divider vertical />;
 * console.log(vnode.props.vertical); // => true
 * ```
 */
export const Divider = (props: Props) => {
  return (
    <hr
      class={props.vertical ? "h-full" : "w-full"}
      aria-orientation={props.vertical ? "vertical" : "horizontal"}
    />
  );
};
