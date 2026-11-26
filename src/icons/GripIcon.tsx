import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The grip-vertical element data — six dots in two columns of
 * three, the grip glyph hosts render for draggable rows today —
 * drawn to Feather's construction specifications (24x24 viewBox,
 * stroke-based circles, r 1, matching MoreIcon's dot geometry).
 */
const gripElements: IconElement[] = [
  { kind: "circle", cx: "9", cy: "5", r: "1" },
  { kind: "circle", cx: "15", cy: "5", r: "1" },
  { kind: "circle", cx: "9", cy: "12", r: "1" },
  { kind: "circle", cx: "15", cy: "12", r: "1" },
  { kind: "circle", cx: "9", cy: "19", r: "1" },
  { kind: "circle", cx: "15", cy: "19", r: "1" },
];

/** The grip glyph: the drag-handle visual for reorderable rows (spudly/design-system#878). Rendered through the Icon base component. */
export function GripIcon(props: IconComponentProps) {
  return <Icon elements={gripElements} {...props} />;
}
