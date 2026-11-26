import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather check-circle element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const successElements: IconElement[] = [
  { kind: "path", d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" },
  { kind: "polyline", points: "22 4 12 14.01 9 11.01" },
];

/** The check-circle glyph: success and completion states. Rendered through the Icon base component. */
export function SuccessIcon(props: IconComponentProps) {
  return <Icon elements={successElements} {...props} />;
}
