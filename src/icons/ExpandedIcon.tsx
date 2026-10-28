import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather chevron-up element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const chevronUpElements: IconElement[] = [{ kind: "polyline", points: "18 15 12 9 6 15" }];

/** The chevron-up glyph: an expanded disclosure (content shown, collapse to hide). Rendered through the Icon base component. */
export function ExpandedIcon(props: IconComponentProps) {
  return <Icon elements={chevronUpElements} {...props} />;
}
