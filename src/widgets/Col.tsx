import { YStack } from "tamagui";
import type { GetProps } from "tamagui";
import { resolveLayoutStyle } from "./layout.js";
import type { LayoutAlignProps } from "./layout.js";

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
> &
  LayoutAlignProps;

/**
 * The vertical layout primitive (spudly/design-system#746,
 * tranche 1): renders a YStack whose layout comes only from the
 * strict semantic prop subset in `./layout.js` — the same props as
 * Row, translated to the vertical axis (`top` / `middle` /
 * `bottom` on the main axis, `left` / `center` / `right` on the
 * cross axis). There are NO margin or padding props and NO width
 * props on Col: spacing between siblings is the parent's `gap`,
 * and separation from surrounding content is the parent's job.
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
  });
  return <YStack {...resolved} {...rest} />;
}
