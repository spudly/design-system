import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The divided-plate element data — the one glyph in this module that
 * is NOT official Feather data. Feather has no plate icon, so this
 * glyph is an original design (Stephen's, iterated from rendered
 * drafts in review) drawn to Feather's construction specifications:
 * the same 24x24 grid, 2px stroke, round caps and joins, and no
 * fill, so it sits invisibly alongside the Feather glyphs. The
 * shape: a circle for the plate rim, with three outlined portions
 * inside it — two quarter portions across the top and one half
 * portion along the bottom. Every inner arc is concentric with the
 * rim (same center, 12,12), so the portions' curves follow the
 * plate's own curve.
 */
const mealsElements: IconElement[] = [
  { kind: "circle", cx: "12", cy: "12", r: "9" },
  { kind: "path", d: "M6.17 10.6 L10.6 10.6 L10.6 6.17 A6 6 0 0 0 6.17 10.6 Z" },
  { kind: "path", d: "M17.83 10.6 L13.4 10.6 L13.4 6.17 A6 6 0 0 1 17.83 10.6 Z" },
  { kind: "path", d: "M6.22 13.6 A6 6 0 0 0 17.78 13.6 Z" },
];

/** The divided-plate glyph: meals and meal planning. Rendered through the Icon base component. */
export function MealsIcon(props: IconComponentProps) {
  return <Icon elements={mealsElements} {...props} />;
}
