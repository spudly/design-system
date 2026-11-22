import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather eye element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const eyeElements: IconElement[] = [
  { kind: "path", d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" },
  { kind: "circle", cx: "12", cy: "12", r: "3" },
];

/** The eye glyph: a password is currently concealed and can be shown (PasswordField's show toggle, #758). Rendered through the Icon base component. */
export function EyeIcon(props: IconComponentProps) {
  return <Icon elements={eyeElements} {...props} />;
}
