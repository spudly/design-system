import { useTheme } from "tamagui";
import {
  resolveTagColorShade,
  resolveTagColorValue,
  tagColorNames,
  tagColorShadeThemeKey,
  tagColorThemeKey,
  type TagColorName,
  type TagColorShade,
  type TagColorShades,
  type TagColorValues,
} from "../themes/tagColors.js";

/**
 * The one shared tag-color resolution for components (#207): returns a
 * resolver that maps a tag color NAME to the active theme's concrete
 * hex.
 *
 * The active theme's values are read from the Tamagui theme, where the
 * config registers each name under `tagColorThemeKey(name)`; the pure
 * name → hex mapping lives in `resolveTagColorValue` in
 * themes/tagColors.ts. The resolver accepts names only — the strict
 * `TagColorName` typing is what keeps raw hexes out of the component
 * tree (stored data converts through `tagColorNameForHex` at the data
 * boundary). Badge, ColorPickerField, TagsPage, and RecipeDetailPage
 * all go through this hook.
 */
export function useTagColorResolver(): (name: TagColorName) => string {
  const theme = useTheme();
  const themeColors: Partial<TagColorValues> = {};
  for (const name of tagColorNames) {
    const variable = theme[tagColorThemeKey(name)];
    if (typeof variable?.val === "string") {
      themeColors[name] = variable.val;
    }
  }
  return (name: TagColorName) => resolveTagColorValue(name, themeColors);
}

/**
 * The shade-pair companion to `useTagColorResolver` (#799): returns a
 * resolver that maps a tag color NAME + shade to the active theme's
 * concrete hex, reading the `tag<Name>Dark` / `tag<Name>Light` keys
 * the config registers. Badge's inverted tag form uses it so the
 * dark background / light ink pair stays a theme token decision.
 */
export function useTagColorShadeResolver(): (
  name: TagColorName,
  shade: TagColorShade,
) => string {
  const theme = useTheme();
  const themeShades: Partial<TagColorShades> = {};
  for (const name of tagColorNames) {
    const dark = theme[tagColorShadeThemeKey(name, "dark")];
    const light = theme[tagColorShadeThemeKey(name, "light")];
    if (typeof dark?.val === "string" && typeof light?.val === "string") {
      themeShades[name] = { dark: dark.val, light: light.val };
    }
  }
  return (name, shade) => resolveTagColorShade(name, shade, themeShades);
}
