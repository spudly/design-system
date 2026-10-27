import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather printer element data (feathericons/feather,
 * ISC licensed) — copied from the Feather SVG source, not redrawn.
 */
const printerElements: IconElement[] = [
  { kind: "polyline", points: "6 9 6 2 18 2 18 9" },
  {
    kind: "path",
    d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
  },
  { kind: "rect", x: "6", y: "14", width: "12", height: "8" },
];

/** The printer glyph: print actions (spudly/design-system#187). Rendered through the Icon base component. */
export function PrintIcon(props: IconComponentProps) {
  return <Icon elements={printerElements} {...props} />;
}
