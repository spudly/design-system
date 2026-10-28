import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather chevron-down element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const chevronDownElements: IconElement[] = [{ kind: "polyline", points: "6 9 12 15 18 9" }];

/** The chevron-down glyph: a collapsed disclosure (content hidden below). Rendered through the Icon base component. */
export function CollapsedIcon(props: IconComponentProps) {
  return <Icon elements={chevronDownElements} {...props} />;
}
