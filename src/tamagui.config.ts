import { createTamagui } from "tamagui";
import { tokens } from "./tokens/index.js";
import { baseTheme, type SemanticColors } from "./themes/base.js";

/**
 * Convert our semantic color roles into a Tamagui theme object.
 * Tamagui components resolve `background`, `color`, `borderColor` (+ state
 * variants); the semantic aliases let app code reference brand roles.
 */
function toTamaguiTheme(semantic: SemanticColors, dark: boolean) {
  return {
    background: semantic.background,
    backgroundHover: semantic.surface,
    backgroundPress: semantic.border,
    backgroundFocus: semantic.surface,
    color: semantic.text,
    colorHover: semantic.text,
    colorPress: semantic.text,
    colorFocus: semantic.text,
    borderColor: semantic.border,
    borderColorHover: semantic.textMuted,
    borderColorPress: semantic.border,
    borderColorFocus: semantic.primary,
    shadowColor: dark ? "#000000" : semantic.border,
    placeholderColor: semantic.textMuted,
    // Semantic aliases (brand roles).
    primary: semantic.primary,
    primaryHover: semantic.primaryHover,
    primaryActive: semantic.primaryActive,
    onPrimary: semantic.onPrimary,
    surface: semantic.surface,
    textMuted: semantic.textMuted,
    success: semantic.success,
    warning: semantic.warning,
    danger: semantic.danger,
  };
}

const darkSemantic: SemanticColors = {
  background: tokens.colors.gray.gray10,
  surface: tokens.colors.gray.gray9,
  text: tokens.colors.gray.gray1,
  textMuted: tokens.colors.gray.gray5,
  border: tokens.colors.gray.gray7,
  primary: baseTheme.semantic.primary,
  primaryHover: baseTheme.semantic.primaryHover,
  primaryActive: baseTheme.semantic.primaryActive,
  onPrimary: baseTheme.semantic.onPrimary,
  success: baseTheme.semantic.success,
  warning: baseTheme.semantic.warning,
  danger: baseTheme.semantic.danger,
};

/**
 * Tamagui configuration wiring the design-system tokens in.
 *
 * Consumers wrap their app in `<TamaguiProvider config={tamaguiConfig}>`
 * (web) / the native equivalent. Components in this package reference the
 * raw `tokens` object directly so they stay usable even without the provider,
 * while the config below additionally exposes `$token` shorthands for
 * app-level styling.
 *
 * NOTE: media breakpoints and font configs are intentionally minimal here;
 * they grow with the first real design direction. Theme values are
 * placeholders pending the design brief.
 */
export const tamaguiConfig = createTamagui({
  tokens: {
    color: {
      ...tokens.colors.gray,
      ...tokens.colors.primary,
      ...tokens.colors.success,
      ...tokens.colors.warning,
      ...tokens.colors.danger,
    },
    space: { ...tokens.spacing },
    size: { ...tokens.spacing },
    radius: { ...tokens.radii },
    zIndex: { base: 0, above: 10, modal: 100 },
  },
  themes: {
    light: toTamaguiTheme(baseTheme.semantic, false),
    dark: toTamaguiTheme(darkSemantic, true),
  },
});

export default tamaguiConfig;

type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}
