import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather list element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const listElements: IconElement[] = [
  { kind: "line", x1: "8", y1: "6", x2: "21", y2: "6" },
  { kind: "line", x1: "8", y1: "12", x2: "21", y2: "12" },
  { kind: "line", x1: "8", y1: "18", x2: "21", y2: "18" },
  { kind: "line", x1: "3", y1: "6", x2: "3.01", y2: "6" },
  { kind: "line", x1: "3", y1: "12", x2: "3.01", y2: "12" },
  { kind: "line", x1: "3", y1: "18", x2: "3.01", y2: "18" },
];

/** The list glyph: list-shaped sections (RecipeDetailPage's Ingredients heading, #721). Rendered through the Icon base component. */
export function ListIcon(props: IconComponentProps) {
  return <Icon elements={listElements} {...props} />;
}
