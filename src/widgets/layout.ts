import { tokens } from "../tokens/index.js";

/**
 * Shared layout vocabulary for the Row / Col / Spacer primitives
 * (spudly/design-system#746, tranche 1).
 *
 * Row and Col accept NO general style props and NO variants. They
 * accept Stephen's strict subset of semantic props (his table,
 * 2026-11-21): each prop names a visual intent, and Row/Col
 * translate it to the flex property for their axis — `left` always
 * means "toward the left", whichever axis that is. The subset is
 * closed: a conversion site that fits no combination of these
 * props stops and comes back to Stephen rather than adding a prop.
 * Padding joined the subset on 2026-11-24 (Stephen's amendment):
 * `p` / `px` / `py` in the same t-shirt sizes as `gap`, applied
 * uniformly in each direction — single-side padding stays banned.
 */

/** T-shirt spacing sizes for `gap` and Spacer's `x` / `y`. */
export type LayoutSize = "xs" | "s" | "m" | "l" | "xl" | "xxl";

/** Each t-shirt size maps to one step of the spacing token scale. */
export const layoutSizeValues: Record<LayoutSize, number> = {
  xs: tokens.spacing[1],
  s: tokens.spacing[2],
  m: tokens.spacing[3],
  l: tokens.spacing[4],
  xl: tokens.spacing[6],
  xxl: tokens.spacing[8],
};

export type LayoutAxis = "row" | "col";

export type LayoutAlignProps = {
  /** flex-grow: true → 1, false → 0, a number passes through. */
  grow?: boolean | number;
  /** flex-shrink: true → 1, false → 0, a number passes through. */
  shrink?: boolean | number;
  /** flex-wrap: true → wrap, false → nowrap. */
  wrap?: boolean;
  /** Row: justify flex-start. Col: align flex-start. */
  left?: boolean;
  /** Row: justify flex-end. Col: align flex-end. */
  right?: boolean;
  /** Row: justify center. Col: align center. */
  center?: boolean;
  /** Row: align flex-start. Col: justify flex-start. */
  top?: boolean;
  /** Row: align center. Col: justify center. */
  middle?: boolean;
  /** Row: align flex-end. Col: justify flex-end. */
  bottom?: boolean;
  /** justify + align-content: space-between. */
  between?: boolean;
  /** justify + align-content: space-around. */
  around?: boolean;
  /** justify + align-content: space-evenly. */
  evenly?: boolean;
  /** align-items + align-content: stretch. */
  stretch?: boolean;
  /** align-items: baseline. */
  baseline?: boolean;
  /** The parent's sibling spacing, in t-shirt sizes. */
  gap?: LayoutSize;
  /**
   * Uniform padding on all four sides, in t-shirt sizes
   * (Stephen, 2026-11-24). Padding is the ONLY box spacing Row/Col
   * accept, and only in these uniform-per-direction forms — there
   * are no single-side padding props and no margin props.
   */
  p?: LayoutSize;
  /** Uniform horizontal padding (left + right), in t-shirt sizes. */
  px?: LayoutSize;
  /** Uniform vertical padding (top + bottom), in t-shirt sizes. */
  py?: LayoutSize;
};

export type ResolvedLayoutStyle = {
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  flexWrap?: string;
  flexGrow?: number;
  flexShrink?: number;
  gap?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
};

/**
 * Resolve the semantic props to concrete flex properties for one
 * axis. Same-axis conflicts are a caller error; they resolve by a
 * fixed precedence so behavior is never undefined: on the main
 * axis, distribution props (`between` / `around` / `evenly`) win,
 * then `center` / `middle`, then `right` / `bottom`, then
 * `left` / `top`; on the cross axis, `stretch` / `baseline` sit
 * above the position props.
 */
export function resolveLayoutStyle(
  axis: LayoutAxis,
  props: { [K in keyof LayoutAlignProps]?: LayoutAlignProps[K] | undefined },
): ResolvedLayoutStyle {
  const resolved: ResolvedLayoutStyle = {};

  if (props.grow !== undefined) {
    resolved.flexGrow = props.grow === true ? 1 : props.grow === false ? 0 : props.grow;
  }
  if (props.shrink !== undefined) {
    resolved.flexShrink = props.shrink === true ? 1 : props.shrink === false ? 0 : props.shrink;
  }
  if (props.wrap !== undefined) {
    resolved.flexWrap = props.wrap ? "wrap" : "nowrap";
  }
  if (props.gap !== undefined) {
    resolved.gap = layoutSizeValues[props.gap];
  }
  // Padding (Stephen, 2026-11-24): uniform per direction only.
  // `px` / `py` resolve to the horizontal / vertical pair, which
  // the layout engine applies over the `p` value on that axis.
  if (props.p !== undefined) {
    resolved.padding = layoutSizeValues[props.p];
  }
  if (props.px !== undefined) {
    resolved.paddingHorizontal = layoutSizeValues[props.px];
  }
  if (props.py !== undefined) {
    resolved.paddingVertical = layoutSizeValues[props.py];
  }

  // Main axis: justify-content. The position prop names differ by
  // axis (Row reads left/center/right; Col reads top/middle/bottom);
  // the distribution props read the same on both.
  const mainStart = axis === "row" ? props.left : props.top;
  const mainCenter = axis === "row" ? props.center : props.middle;
  const mainEnd = axis === "row" ? props.right : props.bottom;
  if (props.between) {
    resolved.justifyContent = "space-between";
    resolved.alignContent = "space-between";
  } else if (props.around) {
    resolved.justifyContent = "space-around";
    resolved.alignContent = "space-around";
  } else if (props.evenly) {
    resolved.justifyContent = "space-evenly";
    resolved.alignContent = "space-evenly";
  } else if (mainCenter) {
    resolved.justifyContent = "center";
  } else if (mainEnd) {
    resolved.justifyContent = "flex-end";
  } else if (mainStart) {
    resolved.justifyContent = "flex-start";
  }

  // Cross axis: align-items. Row reads top/middle/bottom; Col reads
  // left/center/right. stretch/baseline outrank the position props,
  // and stretch also sets align-content (Stephen's table) unless a
  // distribution prop already claimed it.
  const crossStart = axis === "row" ? props.top : props.left;
  const crossCenter = axis === "row" ? props.middle : props.center;
  const crossEnd = axis === "row" ? props.bottom : props.right;
  if (props.stretch) {
    resolved.alignItems = "stretch";
    resolved.alignContent ??= "stretch";
  } else if (props.baseline) {
    resolved.alignItems = "baseline";
  } else if (crossCenter) {
    resolved.alignItems = "center";
  } else if (crossEnd) {
    resolved.alignItems = "flex-end";
  } else if (crossStart) {
    resolved.alignItems = "flex-start";
  }

  return resolved;
}
