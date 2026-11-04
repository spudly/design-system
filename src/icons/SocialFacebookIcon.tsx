import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather facebook element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 * Added for BigFooter's social links (#410): social entries name a
 * Feather glyph, and this module is that glyph's data.
 */
const facebookIconElements: IconElement[] = [
  { kind: "path", d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
];

/** The Feather facebook glyph: a social destination's icon in BigFooter. Rendered through the Icon base component. */
export function SocialFacebookIcon(props: IconComponentProps) {
  return <Icon elements={facebookIconElements} {...props} />;
}
