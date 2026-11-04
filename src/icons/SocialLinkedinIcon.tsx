import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather linkedin element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 * Added for BigFooter's social links (#410): social entries name a
 * Feather glyph, and this module is that glyph's data.
 */
const linkedinIconElements: IconElement[] = [
  { kind: "path", d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4" },
  { kind: "rect", x: "2", y: "9", width: "4", height: "12" },
  { kind: "circle", cx: "4", cy: "4", r: "2" },
];

/** The Feather linkedin glyph: a social destination's icon in BigFooter. Rendered through the Icon base component. */
export function SocialLinkedinIcon(props: IconComponentProps) {
  return <Icon elements={linkedinIconElements} {...props} />;
}
