import { Col } from "./Col.js";
import type { ColProps } from "./Col.js";

export type CenterProps = Omit<
  ColProps,
  "center" | "stretch" | "middle" | "top" | "grow" | "shrink" | "fill"
> & {
  /** Center the child horizontally (default true). */
  horizontal?: boolean;
  /** Center the child vertically within the Center's own
   * height (default true). */
  vertical?: boolean;
  /** Grow to fill the height the parent offers (default
   * false) — the full-area form, e.g. a detail page's loading
   * state filling its shell's content region so the spinner
   * centers on the page, not just within its own height. */
  fill?: boolean;
};

/**
 * Centers a single child (#119): the dedicated centering
 * component — a loading spinner standing in for page content, a
 * lone notice. It wraps ONE child; `horizontal` and `vertical`
 * choose the dimensions to center on, both defaulting to true.
 * Layout stacks are not centering tools: a stack with a single
 * hardcoded child is a sign Center was meant, so stacks do not
 * offer alignment props for this.
 *
 * #746 (Option B): the booleans translate to Col's semantic
 * props in code — `horizontal` is Col's cross axis (`center`,
 * or `stretch` when off), `vertical` its main axis (`middle`,
 * or `top` when off), and `fill` is the plan's flex: 1
 * translation (`grow shrink`). No styled root.
 */
export function Center({ horizontal = true, vertical = true, fill = false, ...rest }: CenterProps) {
  return (
    <Col
      {...(horizontal ? { center: true } : { stretch: true })}
      {...(vertical ? { middle: true } : { top: true })}
      {...(fill ? { grow: true, shrink: true } : null)}
      {...rest}
    />
  );
}
