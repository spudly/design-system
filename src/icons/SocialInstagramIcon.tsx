import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather instagram element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 * Added for BigFooter's social links (#410): social entries name a
 * Feather glyph, and this module is that glyph's data.
 */
const instagramIconElements: IconElement[] = [
  { kind: "rect", x: "2", y: "2", width: "20", height: "20", rx: "5", ry: "5" },
  { kind: "path", d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" },
  { kind: "line", x1: "17.5", y1: "6.5", x2: "17.51", y2: "6.5" },
];

/** The Feather instagram glyph: a social destination's icon in BigFooter. Rendered through the Icon base component. */
export function SocialInstagramIcon(props: IconComponentProps) {
  return <Icon elements={instagramIconElements} {...props} />;
}
