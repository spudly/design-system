import { useTheme } from "tamagui";
import { tokens } from "../tokens/index.js";

/**
 * A glyph's ink for a Button variant: the same colors the variant's
 * text label gets, resolved to concrete values because
 * react-native-svg cannot resolve Tamagui theme variables — the
 * theme roles (onPrimary, link) are read from the active theme,
 * following the tag-color resolver's pattern (widgets/tagColors).
 * The fallbacks are the base theme's values for those roles.
 *
 * Shared by Button's icon slot and DropdownButton's disclosure
 * chevron, which must always match the label ink of the variant
 * they sit in. The ghost prop's ink follows the ghost label colors:
 * the variant's own ink, resolved like the label colors. The
 * optional danger tone (#480) takes the danger8 ink outright.
 */
export function useVariantGlyphInk(
  variant: string | undefined,
  ghost = false,
  dangerTone = false,
): string {
  const theme = useTheme();
  if (dangerTone) return tokens.colors.danger.danger8;
  const roleValue = (key: string): string | undefined => {
    const variable = theme[key];
    return typeof variable?.val === "string" ? variable.val : undefined;
  };
  if (ghost) {
    switch (variant) {
      case "secondary":
        return tokens.colors.gray.gray10;
      case "danger":
        return tokens.colors.danger.danger7;
      case "primary":
      default:
        return roleValue("primary") ?? tokens.colors.primary.primary7;
    }
  }
  switch (variant) {
    case "secondary":
      return tokens.colors.gray.gray10;
    case "ghost":
      return roleValue("link") ?? tokens.colors.primary.primary8;
    case "danger":
      return "#ffffff";
    case "primary":
    default:
      return roleValue("onPrimary") ?? "#ffffff";
  }
}
