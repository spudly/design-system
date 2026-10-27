import { Circle, Line, Path, Polyline, Rect, Svg } from "react-native-svg";

/**
 * The design system's icons module (spudly/eciperay#246): the Feather
 * icon set, shipped as the official Feather SVG element data (from
 * feathericons/feather, ISC licensed) rendered with react-native-svg.
 *
 * Why this exists: eciperay's packages/icons package owned the icon
 * mapping while the apps rendered the glyphs through two different
 * icon-font stacks (react-icons/fi on web,
 * react-native-vector-icons/Feather on native) — and DS pages that
 * needed an icon had no set to draw from at all, which is how
 * RecipeDetailPage ended up with emoji glyphs for print/share
 * (spudly/design-system#187). The glyph data and the rendering now
 * live here, in one module.
 *
 * Shape: this file is the base `Icon` renderer — the only component
 * that knows about SVG structure. Each icon is its own module
 * (HomeIcon.tsx, PrintIcon.tsx, …) embedding only its own glyph's
 * element data and exporting one component under a semantic, usage
 * name (PrintIcon, not "printer"), so unused icons tree-shake out
 * and call sites never name the icon set. If the set is ever swapped,
 * the glyph data in the per-icon modules and this renderer are what
 * change; semantic call sites do not. Do NOT substitute react-icons /
 * react-native-vector-icons / icon fonts, and do NOT hand-draw
 * replacement glyphs: when a new icon is needed, add a module with
 * the official Feather element data for the glyph that fits its use.
 *
 * What does NOT live here: any mapping from app concepts to icons
 * (e.g. which icon a tab uses). That is app configuration and
 * belongs to the consuming app.
 *
 * Placement: icons live behind the `@spudly/ui/icons` subpath
 * export, not the package root — this module imports
 * react-native-svg, and the root entry must stay importable in
 * plain Node (the same reason pages live behind `@spudly/ui/pages`).
 */

/** One SVG child element of an icon, in Feather's own terms. */
export type IconElement =
  | { kind: "path"; d: string }
  | { kind: "polyline"; points: string }
  | { kind: "line"; x1: string; y1: string; x2: string; y2: string }
  | { kind: "circle"; cx: string; cy: string; r: string }
  | { kind: "rect"; x: string; y: string; width: string; height: string };

function renderElement(element: IconElement, index: number) {
  switch (element.kind) {
    case "path":
      return <Path key={index} d={element.d} />;
    case "polyline":
      return <Polyline key={index} points={element.points} />;
    case "line":
      return <Line key={index} x1={element.x1} y1={element.y1} x2={element.x2} y2={element.y2} />;
    case "circle":
      return <Circle key={index} cx={element.cx} cy={element.cy} r={element.r} />;
    case "rect":
      return (
        <Rect
          key={index}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
        />
      );
  }
}

export type IconProps = {
  /**
   * The glyph's SVG elements: the official Feather element data for
   * one icon (24x24 viewBox, stroke-based, no fill). The per-icon
   * components supply their own; pass elements directly only when
   * rendering through this base component itself.
   */
  elements: IconElement[];
  /** Square size in px. Defaults to Feather's native 24. */
  size?: number;
  /**
   * Stroke color (any CSS color). Defaults to "currentColor", so the
   * icon inherits the surrounding text color where the platform
   * supports it; pass an explicit color when it does not.
   */
  color?: string;
  /** Stroke width. Feather's native weight is 2. */
  strokeWidth?: number;
  /** When set, the icon is exposed to assistive tech under this label; otherwise it is decorative (aria-hidden). */
  accessibilityLabel?: string;
};

/** The props every per-icon component takes: IconProps without the glyph data it supplies itself. */
export type IconComponentProps = Omit<IconProps, "elements">;

/**
 * An icon rendered from Feather SVG element data with
 * react-native-svg — the same geometry on web and native, in the
 * caller's color and size, with Feather's stroke treatment (2px,
 * round caps and joins, no fill) unless overridden. Prefer the
 * per-icon components (PrintIcon, ShareIcon, …); render through
 * Icon directly only for a glyph that has no component yet.
 */
export function Icon({
  elements,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  accessibilityLabel,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(accessibilityLabel ? { accessibilityLabel } : { "aria-hidden": true as const })}
    >
      {elements.map(renderElement)}
    </Svg>
  );
}
