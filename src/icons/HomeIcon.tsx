import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather home element data (feathericons/feather,
 * ISC licensed) — copied from the Feather SVG source, not redrawn.
 */
const homeElements: IconElement[] = [
  { kind: "path", d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { kind: "polyline", points: "9 22 9 12 15 12 15 22" },
];

/** The home glyph: home screens and start destinations. Rendered through the Icon base component. */
export function HomeIcon(props: IconComponentProps) {
  return <Icon elements={homeElements} {...props} />;
}
