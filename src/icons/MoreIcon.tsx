import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather more-vertical element data
 * (feathericons/feather, MIT licensed) — copied from the Feather
 * SVG source, not redrawn.
 */
const moreVerticalElements: IconElement[] = [
  { kind: "circle", cx: "12", cy: "12", r: "1" },
  { kind: "circle", cx: "12", cy: "5", r: "1" },
  { kind: "circle", cx: "12", cy: "19", r: "1" },
];

/** The vertical-ellipsis glyph: overflow / more-actions triggers (spudly/design-system#791). Rendered through the Icon base component. */
export function MoreIcon(props: IconComponentProps) {
  return <Icon elements={moreVerticalElements} {...props} />;
}
