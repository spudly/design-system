import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather tag element data (feathericons/feather,
 * ISC licensed) — copied from the Feather SVG source, not redrawn.
 */
const tagElements: IconElement[] = [
  {
    kind: "path",
    d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
  },
  { kind: "line", x1: "7", y1: "7", x2: "7.01", y2: "7" },
];

/** The tag glyph: tags and labels. Rendered through the Icon base component. */
export function TagsIcon(props: IconComponentProps) {
  return <Icon elements={tagElements} {...props} />;
}
