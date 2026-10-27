import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather coffee element data (feathericons/feather,
 * ISC licensed) — copied from the Feather SVG source, not redrawn.
 */
const mealsElements: IconElement[] = [
  { kind: "path", d: "M18 8h1a4 4 0 0 1 0 8h-1" },
  { kind: "path", d: "M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
  { kind: "line", x1: "6", y1: "1", x2: "6", y2: "4" },
  { kind: "line", x1: "10", y1: "1", x2: "10", y2: "4" },
  { kind: "line", x1: "14", y1: "1", x2: "14", y2: "4" },
];

/** The coffee glyph: meals and meal planning. Rendered through the Icon base component. */
export function MealsIcon(props: IconComponentProps) {
  return <Icon elements={mealsElements} {...props} />;
}
