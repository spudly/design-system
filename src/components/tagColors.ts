import { useTheme } from "tamagui";
import {
  resolveTagColorValue,
  tagColorNames,
  tagColorThemeKey,
  type TagColorName,
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
 * boundary). TagPill, ColorPickerField, TagsPage, and RecipeDetailPage
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
