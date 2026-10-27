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
 * The set is STRICT and enforced by TypeScript (Stephen, #207
 * follow-up): every prop that carries a tag color is typed
 * `TagColorName`, so a raw hex in TSX is a compile error, and
 * resolution (`resolveTagColorValue`) accepts names only — there is
 * no pass-through of unknown values, so a future rebrand only
 * touches the token tables below.
 *
 * Stored-data mapping: tags created before this change hold raw hex
 * values. The Warm Harvest values below ARE the legacy app palette,
 * verbatim, so every stored hex maps 1:1 to a name by value.
 * `tagColorNameForHex` is the single conversion boundary for stored
 * data: a known palette hex converts to its name, and an unknown
 * stored hex falls back to the default name (`defaultTagColorName`)
 * rather than rendering as itself. The mapping lives here, in the
 * design system, rather than in an app-side migration, because the
 * palette it maps from is a design-system palette.
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

/**
 * The fallback tag color: a stored value that is not one of the
 * twelve palette hexes converts to this name at the
 * `tagColorNameForHex` boundary instead of passing through.
 */
export const defaultTagColorName: TagColorName = "gray";

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
 * The token name for a stored legacy palette hex — the single
 * conversion boundary between stored tag data and the typed
 * `TagColorName` API. Matching is case-insensitive; the palette
 * hexes are the Warm Harvest values. A hex that is not one of the
 * twelve palette values returns `defaultTagColorName`: unknown
 * stored colors never pass through as raw hex.
 */
export function tagColorNameForHex(hex: string): TagColorName {
  const normalized = hex.trim().toLowerCase();
  return (
    tagColorNames.find((name) => warmHarvestTagColors[name] === normalized) ?? defaultTagColorName
  );
}

/**
 * Resolve a tag color NAME to the concrete hex to render, through
 * `themeColors` (the active theme's values), falling back to the
 * Warm Harvest value when the theme assigns none. Names only: raw
 * hexes are a compile error here — stored data converts through
 * `tagColorNameForHex` first.
 */
export function resolveTagColorValue(
  name: TagColorName,
  themeColors?: Partial<TagColorValues>,
): string {
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
