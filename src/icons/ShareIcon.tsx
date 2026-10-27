import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather share-2 element data (feathericons/feather,
 * ISC licensed) — copied from the Feather SVG source, not redrawn.
 */
const shareElements: IconElement[] = [
  { kind: "circle", cx: "18", cy: "5", r: "3" },
  { kind: "circle", cx: "6", cy: "12", r: "3" },
  { kind: "circle", cx: "18", cy: "19", r: "3" },
  { kind: "line", x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" },
  { kind: "line", x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" },
];

/** The share-2 glyph: share actions (spudly/design-system#187). Rendered through the Icon base component. */
export function ShareIcon(props: IconComponentProps) {
  return <Icon elements={shareElements} {...props} />;
}
