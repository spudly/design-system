import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather alert-circle element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const errorElements: IconElement[] = [
  { kind: "circle", cx: "12", cy: "12", r: "10" },
  { kind: "line", x1: "12", y1: "8", x2: "12", y2: "12" },
  { kind: "line", x1: "12", y1: "16", x2: "12.01", y2: "16" },
];

/** The alert-circle glyph: error states. Rendered through the Icon base component. */
export function ErrorIcon(props: IconComponentProps) {
  return <Icon elements={errorElements} {...props} />;
}
