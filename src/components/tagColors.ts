import { useTheme } from "tamagui";
import {
  resolveTagColorValue,
  tagColorNames,
  tagColorThemeKey,
  type TagColorValues,
} from "../themes/tagColors.js";

/**
 * The one shared tag-color resolution for components (#207): returns a
 * resolver that maps a tag color value — a token name ("blue") or a
 * stored legacy hex — to the active theme's concrete hex.
 *
 * The active theme's values are read from the Tamagui theme, where the
 * config registers each name under `tagColorThemeKey(name)`; the pure
 * mapping rules (name lookup, legacy hex → name, unknown passthrough)
 * live in `resolveTagColorValue` in themes/tagColors.ts. Components
 * never resolve names or hexes on their own — TagPill,
 * ColorPickerField, TagsPage, and RecipeDetailPage all go through
 * this hook.
 */
export function useTagColorResolver(): (value: string) => string {
  const theme = useTheme();
  const themeColors: Partial<TagColorValues> = {};
  for (const name of tagColorNames) {
    const variable = theme[tagColorThemeKey(name)];
    if (typeof variable?.val === "string") {
      themeColors[name] = variable.val;
    }
  }
  return (value: string) => resolveTagColorValue(value, themeColors);
}
