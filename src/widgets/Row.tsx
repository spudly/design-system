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
> &
  LayoutAlignProps;

/**
 * The horizontal layout primitive (spudly/design-system#746,
 * tranche 1): renders an XStack whose layout comes only from the
 * strict semantic prop subset in `./layout.js` — axis-aware
 * position props (`left` / `center` / `right` on the main axis,
 * `top` / `middle` / `bottom` on the cross axis), the distribution
 * props (`between` / `around` / `evenly`), `stretch` / `baseline`,
 * `grow` / `shrink` / `wrap`, and the t-shirt `gap`. There are NO
 * margin or padding props and NO width props on Row: spacing
 * between siblings is the parent's `gap`, and separation from
 * surrounding content is the parent's job.
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
  });
  return <XStack {...resolved} {...rest} />;
}
