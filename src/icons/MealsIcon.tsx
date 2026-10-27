import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The divided-plate element data — the one glyph in this module that
 * is NOT official Feather data. Feather has no plate icon, so this
 * glyph is an original design (Stephen's, iterated from rendered
 * drafts in review) drawn to Feather's construction specifications:
 * the same 24x24 grid, 2px stroke, round caps and joins, and no
 * fill, so it sits invisibly alongside the Feather glyphs. The
 * shape: three outlined portions and no rim — two quarter portions
 * across the top and one half portion along the bottom, enlarged
 * to fill the frame. Every arc is concentric (same center, 12,12),
 * so the portions' curves all follow one curve.
 */
const mealsElements: IconElement[] = [
  { kind: "path", d: "M2.62 10.5 L10.5 10.5 L10.5 2.62 A9.5 9.5 0 0 0 2.62 10.5 Z" },
  { kind: "path", d: "M21.38 10.5 L13.5 10.5 L13.5 2.62 A9.5 9.5 0 0 1 21.38 10.5 Z" },
  { kind: "path", d: "M2.62 13.5 A9.5 9.5 0 0 0 21.38 13.5 Z" },
];

/** The divided-plate glyph: meals and meal planning. Rendered through the Icon base component. */
export function MealsIcon(props: IconComponentProps) {
  return <Icon elements={mealsElements} {...props} />;
}
