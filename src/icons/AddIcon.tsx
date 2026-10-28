import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather plus element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const addElements: IconElement[] = [
  { kind: "line", x1: "12", y1: "5", x2: "12", y2: "19" },
  { kind: "line", x1: "5", y1: "12", x2: "19", y2: "12" },
];

/** The plus glyph: add and create actions. Rendered through the Icon base component. */
export function AddIcon(props: IconComponentProps) {
  return <Icon elements={addElements} {...props} />;
}
