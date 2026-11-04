import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather twitter element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 * Added for BigFooter's social links (#410): social entries name a
 * Feather glyph, and this module is that glyph's data.
 */
const twitterIconElements: IconElement[] = [
  {
    kind: "path",
    d: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  },
];

/** The Feather twitter glyph: a social destination's icon in BigFooter. Rendered through the Icon base component. */
export function SocialTwitterIcon(props: IconComponentProps) {
  return <Icon elements={twitterIconElements} {...props} />;
}
