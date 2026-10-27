import { Circle, Line, Path, Polyline, Rect, Svg } from "react-native-svg";

/**
 * The design system's icon module (spudly/eciperay#246): the Feather
 * icon set, shipped as the official Feather SVG element data (from
 * feathericons/feather, ISC licensed) rendered with react-native-svg.
 *
 * Why this exists: eciperay's packages/icons package owned the
 * featherIconNames / tabIcons mapping while the apps rendered the
 * glyphs through two different icon-font stacks (react-icons/fi on
 * web, react-native-vector-icons/Feather on native) — and DS pages
 * that needed an icon had no set to draw from at all, which is how
 * RecipeDetailPage ended up with emoji glyphs for print/share
 * (spudly/design-system#187). The mapping and the rendering now live
 * here, in one module, typed by Feather name. Do NOT substitute
 * react-icons / react-native-vector-icons / icon fonts, and do NOT
 * hand-draw replacement glyphs: when a new icon is needed, add the
 * official Feather element data for its name below.
 *
 * Placement: icons live behind the `@spudly/ui/icons` subpath export,
 * not the package root — this module imports react-native-svg, and
 * the root entry must stay importable in plain Node (the same reason
 * pages live behind `@spudly/ui/pages`).
 */

export const featherIconNames = [
  "home",
  "book-open",
  "users",
  "plus",
  "tag",
  "user",
  "coffee",
  "alert-triangle",
  "message-circle",
  "printer",
  "share-2",
] as const;

export type FeatherIconName = (typeof featherIconNames)[number];

/** Eciperay's tab-bar mapping, moved verbatim from @eciperay/icons. */
export const tabIcons = {
  Home: "home",
  Recipes: "book-open",
  Meals: "coffee",
  Add: "plus",
  Profile: "user",
  Feedback: "message-circle",
} as const satisfies Record<string, FeatherIconName>;

/** One SVG child element of a Feather icon, in Feather's own terms. */
export type FeatherIconElement =
  | { kind: "path"; d: string }
  | { kind: "polyline"; points: string }
  | { kind: "line"; x1: string; y1: string; x2: string; y2: string }
  | { kind: "circle"; cx: string; cy: string; r: string }
  | { kind: "rect"; x: string; y: string; width: string; height: string };

/**
 * The official Feather element data for every name in
 * featherIconNames (24x24 viewBox, stroke-based, no fill). Copied
 * from the feathericons/feather SVG sources — update from there, not
 * by eye.
 */
export const featherIconElements: Record<FeatherIconName, FeatherIconElement[]> = {
  home: [
    { kind: "path", d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { kind: "polyline", points: "9 22 9 12 15 12 15 22" },
  ],
  "book-open": [
    { kind: "path", d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" },
    { kind: "path", d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  ],
  users: [
    { kind: "path", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
    { kind: "circle", cx: "9", cy: "7", r: "4" },
    { kind: "path", d: "M23 21v-2a4 4 0 0 0-3-3.87" },
    { kind: "path", d: "M16 3.13a4 4 0 0 1 0 7.75" },
  ],
  plus: [
    { kind: "line", x1: "12", y1: "5", x2: "12", y2: "19" },
    { kind: "line", x1: "5", y1: "12", x2: "19", y2: "12" },
  ],
  tag: [
    {
      kind: "path",
      d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
    },
    { kind: "line", x1: "7", y1: "7", x2: "7.01", y2: "7" },
  ],
  user: [
    { kind: "path", d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" },
    { kind: "circle", cx: "12", cy: "7", r: "4" },
  ],
  coffee: [
    { kind: "path", d: "M18 8h1a4 4 0 0 1 0 8h-1" },
    { kind: "path", d: "M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
    { kind: "line", x1: "6", y1: "1", x2: "6", y2: "4" },
    { kind: "line", x1: "10", y1: "1", x2: "10", y2: "4" },
    { kind: "line", x1: "14", y1: "1", x2: "14", y2: "4" },
  ],
  "alert-triangle": [
    {
      kind: "path",
      d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    },
    { kind: "line", x1: "12", y1: "9", x2: "12", y2: "13" },
    { kind: "line", x1: "12", y1: "17", x2: "12.01", y2: "17" },
  ],
  "message-circle": [
    {
      kind: "path",
      d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
    },
  ],
  printer: [
    { kind: "polyline", points: "6 9 6 2 18 2 18 9" },
    {
      kind: "path",
      d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
    },
    { kind: "rect", x: "6", y: "14", width: "12", height: "8" },
  ],
  "share-2": [
    { kind: "circle", cx: "18", cy: "5", r: "3" },
    { kind: "circle", cx: "6", cy: "12", r: "3" },
    { kind: "circle", cx: "18", cy: "19", r: "3" },
    { kind: "line", x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" },
    { kind: "line", x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" },
  ],
};

function renderElement(element: FeatherIconElement, index: number) {
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

export type FeatherIconProps = {
  /** Which Feather icon to render. */
  name: FeatherIconName;
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

/**
 * A Feather icon rendered from the official SVG element data with
 * react-native-svg — the same geometry on web and native, in the
 * caller's color and size, with Feather's stroke treatment (2px,
 * round caps and joins, no fill) unless overridden.
 */
export function FeatherIcon({
  name,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  accessibilityLabel,
}: FeatherIconProps) {
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
      {featherIconElements[name].map(renderElement)}
    </Svg>
  );
}
