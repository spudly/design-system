import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather arrow-left element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const backElements: IconElement[] = [
  { kind: "line", x1: "19", y1: "12", x2: "5", y2: "12" },
  { kind: "polyline", points: "12 19 5 12 12 5" },
];

/** The back glyph: back navigation (BackLink, spudly/design-system#462). Rendered through the Icon base component. */
export function BackIcon(props: IconComponentProps) {
  return <Icon elements={backElements} {...props} />;
}
