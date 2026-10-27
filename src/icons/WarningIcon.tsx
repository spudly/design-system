import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather alert-triangle element data (feathericons/feather,
 * ISC licensed) — copied from the Feather SVG source, not redrawn.
 */
const warningElements: IconElement[] = [
  {
    kind: "path",
    d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  },
  { kind: "line", x1: "12", y1: "9", x2: "12", y2: "13" },
  { kind: "line", x1: "12", y1: "17", x2: "12.01", y2: "17" },
];

/** The alert-triangle glyph: warnings and cautions. Rendered through the Icon base component. */
export function WarningIcon(props: IconComponentProps) {
  return <Icon elements={warningElements} {...props} />;
}
