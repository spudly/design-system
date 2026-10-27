/**
 * Named tag colors (#207).
 *
 * Tag colors are design-system tokens, not raw hex values duplicated
 * in the apps: a tag stores a color NAME ("blue", "pink", …), and each
 * brand theme assigns the name its own hex, so the same tag can render
 * as a different shade under Warm Harvest (Eciperay) than under Quiet
 * Dawn (Memorize).
 *
 * Naming audit (Stephen's rule from the #204 review: semantic names
 * first, named hues where no semantic name fits): the tag palette is a
 * set of arbitrary category colors — none of them carries a semantic
 * role like tone's error/warning/success — so all twelve names are
 * hues.
 *
 * Stored-data mapping: tags created before this change hold raw hex
 * values. The Warm Harvest values below ARE the legacy app palette,
 * verbatim, so every stored hex maps 1:1 to a name by value
 * (`tagColorNameForHex`). Resolution (`resolveTagColorValue`) accepts
 * a name or a stored hex: a known hex resolves through its name to
 * the ACTIVE theme's shade, and an unknown value passes through
 * unchanged, so a stored hex always renders. The mapping lives here,
 * in the design system, rather than in an app-side migration, because
 * the palette it maps from is a design-system palette.
 */

/** The twelve tag color names, in the legacy palette's display order. */
export const tagColorNames = [
  "indigo",
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "purple",
  "pink",
  "gray",
] as const;

export type TagColorName = (typeof tagColorNames)[number];

/** One theme's concrete hex for every tag color name. */
export type TagColorValues = Record<TagColorName, string>;

/**
 * Warm Harvest values: the legacy app palette verbatim (the Tailwind
 * 500-step hexes the apps duplicated as raw strings), so existing
 * Eciperay tags map 1:1 by value and render exactly as before.
 */
export const warmHarvestTagColors: TagColorValues = {
  indigo: "#6366f1",
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  lime: "#84cc16",
  green: "#22c55e",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  gray: "#6b7280",
};

/**
 * Quiet Dawn values: the same twelve hues in cooler, slightly muted
 * shades that sit with Quiet Dawn's dawn-paper background and deep
 * teal primary. Memorize has no tags today; these exist so the tokens
 * are theme-complete.
 */
export const quietDawnTagColors: TagColorValues = {
  indigo: "#5d60c9",
  red: "#d84a4a",
  orange: "#e07f42",
  amber: "#dd9618",
  lime: "#7fb539",
  green: "#3da564",
  teal: "#2a9d8f",
  cyan: "#2b9db8",
  blue: "#4a86cc",
  purple: "#9663c7",
  pink: "#d45d8f",
  gray: "#6e7a80",
};

/** Whether a value is one of the twelve tag color names. */
export function isTagColorName(value: string): value is TagColorName {
  return (tagColorNames as readonly string[]).includes(value);
}

/**
 * The token name for a stored legacy palette hex, or undefined when
 * the hex is not one of the twelve palette values. Matching is
 * case-insensitive; the palette hexes are the Warm Harvest values.
 */
export function tagColorNameForHex(hex: string): TagColorName | undefined {
  const normalized = hex.trim().toLowerCase();
  return tagColorNames.find((name) => warmHarvestTagColors[name] === normalized);
}

/**
 * Resolve a tag color value — a token name or a stored hex — to the
 * concrete hex to render.
 *
 * - A token name resolves through `themeColors` (the active theme's
 *   values), falling back to the Warm Harvest value when the theme
 *   assigns none.
 * - A known legacy palette hex maps to its token name first, then
 *   resolves the same way, so stored tags take the active theme's
 *   shade of their color.
 * - Any other value passes through unchanged, so an unrecognized
 *   stored hex still renders as itself.
 */
export function resolveTagColorValue(value: string, themeColors?: Partial<TagColorValues>): string {
  const name = isTagColorName(value) ? value : tagColorNameForHex(value);
  if (!name) return value;
  return themeColors?.[name] ?? warmHarvestTagColors[name];
}

/**
 * The Tamagui theme key a tag color name is registered under
 * (`blue` → `tagBlue`). The config registers every name under this
 * key so components can resolve the active theme's value.
 */
export function tagColorThemeKey(name: TagColorName): string {
  return `tag${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}
