import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather info element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const infoElements: IconElement[] = [
  { kind: "circle", cx: "12", cy: "12", r: "10" },
  { kind: "line", x1: "12", y1: "16", x2: "12", y2: "12" },
  { kind: "line", x1: "12", y1: "8", x2: "12.01", y2: "8" },
];

/** The info glyph: informational states. Rendered through the Icon base component. */
export function InfoIcon(props: IconComponentProps) {
  return <Icon elements={infoElements} {...props} />;
}
