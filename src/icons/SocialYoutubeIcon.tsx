import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather youtube element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 * Added for BigFooter's social links (#410): social entries name a
 * Feather glyph, and this module is that glyph's data.
 */
const youtubeIconElements: IconElement[] = [
  {
    kind: "path",
    d: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z",
  },
  { kind: "polyline", points: "9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" },
];

/** The Feather youtube glyph: a social destination's icon in BigFooter. Rendered through the Icon base component. */
export function SocialYoutubeIcon(props: IconComponentProps) {
  return <Icon elements={youtubeIconElements} {...props} />;
}
