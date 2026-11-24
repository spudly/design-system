import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather eye-off element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const eyeOffElements: IconElement[] = [
  {
    kind: "path",
    d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24",
  },
  { kind: "line", x1: "1", y1: "1", x2: "23", y2: "23" },
];

/** The eye-off glyph: a password is currently revealed and can be hidden (PasswordField's hide toggle, #758). Rendered through the Icon base component. */
export function EyeOffIcon(props: IconComponentProps) {
  return <Icon elements={eyeOffElements} {...props} />;
}
