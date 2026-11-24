import { YStack } from "tamagui";
import type { GetProps } from "tamagui";
import { resolveLayoutStyle } from "../layout.js";
import type { LayoutAlignProps } from "../layout.js";

type YStackProps = GetProps<typeof YStack>;

export type ColProps = Omit<
  YStackProps,
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
 * The vertical layout primitive (spudly/design-system#746,
 * tranche 1): renders a YStack whose layout comes only from the
 * strict semantic prop subset in `./layout.js` — the same props as
 * Row, translated to the vertical axis (`top` / `middle` /
 * `bottom` on the main axis, `left` / `center` / `right` on the
 * cross axis). Padding is available ONLY as the uniform t-shirt
 * props `p` / `px` / `py` (Stephen, 2026-11-24) — no single-side
 * padding, no margins, and NO width props on Col: spacing between
 * siblings is the parent's `gap`.
 */
export function Col({
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
}: ColProps) {
  const resolved = resolveLayoutStyle("col", {
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
  return <YStack {...resolved} {...rest} />;
}
