import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather users element data (feathericons/feather,
 * ISC licensed) — copied from the Feather SVG source, not redrawn.
 */
const usersElements: IconElement[] = [
  { kind: "path", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
  { kind: "circle", cx: "9", cy: "7", r: "4" },
  { kind: "path", d: "M23 21v-2a4 4 0 0 0-3-3.87" },
  { kind: "path", d: "M16 3.13a4 4 0 0 1 0 7.75" },
];

/** The users glyph: content shared with people. Rendered through the Icon base component. */
export function SharedIcon(props: IconComponentProps) {
  return <Icon elements={usersElements} {...props} />;
}
