import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather help-circle element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const helpElements: IconElement[] = [
  { kind: "circle", cx: "12", cy: "12", r: "10" },
  { kind: "path", d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" },
  { kind: "line", x1: "12", y1: "17", x2: "12.01", y2: "17" },
];

/** The help-circle glyph: help and guidance affordances. Rendered through the Icon base component. */
export function HelpIcon(props: IconComponentProps) {
  return <Icon elements={helpElements} {...props} />;
}
