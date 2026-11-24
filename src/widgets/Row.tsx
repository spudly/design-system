import { XStack } from "tamagui";
import type { GetProps } from "tamagui";
import { resolveLayoutStyle } from "./layout.js";
import type { LayoutAlignProps } from "./layout.js";

type XStackProps = GetProps<typeof XStack>;

export type RowProps = Omit<
  XStackProps,
  | "justifyContent"
  | "alignItems"
  | "alignContent"
  | "flexWrap"
  | "flexGrow"
  | "flexShrink"
  | "flex"
  | "gap"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "padding"
  | "paddingHorizontal"
  | "paddingVertical"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "paddingBottom"
  | "p"
  | "px"
  | "py"
  | "pt"
  | "pb"
  | "pl"
  | "pr"
> &
  LayoutAlignProps;

/**
 * The horizontal layout primitive (spudly/design-system#746,
 * tranche 1): renders an XStack whose layout comes only from the
 * strict semantic prop subset in `./layout.js` — axis-aware
 * position props (`left` / `center` / `right` on the main axis,
 * `top` / `middle` / `bottom` on the cross axis), the distribution
 * props (`between` / `around` / `evenly`), `stretch` / `baseline`,
 * `grow` / `shrink` / `wrap`, and the t-shirt `gap`. Padding is
 * available ONLY as the uniform t-shirt props `p` / `px` / `py`
 * (Stephen, 2026-11-24) — no single-side padding, no margins, and
 * NO width props on Row: spacing between siblings is the parent's
 * `gap`.
 */
export function Row({
  grow,
  shrink,
  wrap,
  left,
  right,
  center,
  top,
  middle,
  bottom,
  between,
  around,
  evenly,
  stretch,
  baseline,
  gap,
  p,
  px,
  py,
  ...rest
}: RowProps) {
  const resolved = resolveLayoutStyle("row", {
    grow,
    shrink,
    wrap,
    left,
    right,
    center,
    top,
    middle,
    bottom,
    between,
    around,
    evenly,
    stretch,
    baseline,
    gap,
    p,
    px,
    py,
  });
  return <XStack {...resolved} {...rest} />;
}
