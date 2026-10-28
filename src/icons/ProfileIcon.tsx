import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather user element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const profileElements: IconElement[] = [
  { kind: "path", d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" },
  { kind: "circle", cx: "12", cy: "7", r: "4" },
];

/** The user glyph: profile and account. Rendered through the Icon base component. */
export function ProfileIcon(props: IconComponentProps) {
  return <Icon elements={profileElements} {...props} />;
}
