import { createAnimations } from "@tamagui/animations-css/extras";
import { createTamagui } from "tamagui";
import { tokens } from "./tokens/index.js";
import { baseTheme, eciperayTheme, memorizeTheme, type SemanticColors } from "./themes/index.js";

const animations = createAnimations({
  fast: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  slow: {
    type: "spring",
    damping: 20,
    stiffness: 60,
  },
});

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
    primarySubtle: semantic.primarySubtle,
    primaryEmphasis: semantic.primaryEmphasis,
    link: semantic.link,
    errorText: semantic.errorText,
    accent: semantic.accent,
    surface: semantic.surface,
    textMuted: semantic.textMuted,
    success: semantic.success,
    warning: semantic.warning,
    danger: semantic.danger,
  };
}

/**
 * Tamagui configuration wiring the design-system tokens in.
 *
 * Consumers wrap their app in `<TamaguiProvider config={tamaguiConfig}>`
 * (web) / the native equivalent. Components in this package reference the
 * raw `tokens` object directly so they stay usable even without the provider,
 * while the config below additionally exposes `$token` shorthands for
 * app-level styling.
 *
 * Use `createTamaguiConfig(theme)` to build a config for a specific app
 * theme (e.g. eciperayTheme, memorizeTheme). The default `tamaguiConfig`
 * uses the brand-neutral baseTheme.
 *
 * NOTE: media breakpoints and font configs are intentionally minimal here;
 * they grow with the first real design direction.
 */
const tamaguiTokens = {
  color: {
    ...tokens.colors.gray,
    ...tokens.colors.primary,
    ...tokens.colors.success,
    ...tokens.colors.warning,
    ...tokens.colors.danger,
  },
  space: { ...tokens.spacing },
  size: { ...tokens.spacing },
  // Tamagui requires radius/zIndex keys to be a subset of the size keys.
  // Map our semantic radii onto the numeric size scale (0->0px, 1->4px,
  // 2->8px, 3->12px, 4->16px, matching the 4px-base spacing scale).
  radius: {
    0: tokens.radii.zero,
    1: tokens.radii.sm,
    2: tokens.radii.md,
    3: tokens.radii.lg,
    4: tokens.radii.xl,
  },
  zIndex: {
    0: 0, // base
    1: 10, // above
    2: 100, // modal
  },
};

/** Build the light/dark Tamagui theme pair for one brand theme. */
function buildTamaguiThemes(theme: { semantic: SemanticColors }) {
  const darkSemantic: SemanticColors = {
    background: tokens.colors.gray.gray10,
    surface: tokens.colors.gray.gray9,
    text: tokens.colors.gray.gray1,
    textMuted: tokens.colors.gray.gray5,
    border: tokens.colors.gray.gray7,
    primary: theme.semantic.primary,
    primaryHover: theme.semantic.primaryHover,
    primaryActive: theme.semantic.primaryActive,
    onPrimary: theme.semantic.onPrimary,
    primarySubtle: theme.semantic.primarySubtle,
    primaryEmphasis: theme.semantic.primaryEmphasis,
    // Links switch to the theme's lightened step in dark mode so they keep
    // AA contrast on the dark background/surface.
    link: theme.semantic.linkDark,
    linkDark: theme.semantic.linkDark,
    errorText: theme.semantic.errorTextDark,
    errorTextDark: theme.semantic.errorTextDark,
    accent: theme.semantic.accent,
    success: theme.semantic.success,
    warning: theme.semantic.warning,
    danger: theme.semantic.danger,
  };

  return {
    light: toTamaguiTheme(theme.semantic, false),
    dark: toTamaguiTheme(darkSemantic, true),
  };
}

export function createTamaguiConfig(theme: { semantic: SemanticColors }) {
  return createTamagui({
    animations,
    tokens: tamaguiTokens,
    themes: buildTamaguiThemes(theme),
  });
}

export const tamaguiConfig = createTamaguiConfig(baseTheme);

/** Pre-built Tamagui config using the Eciperay "Warm Harvest" theme. */
export const eciperayTamaguiConfig = createTamaguiConfig(eciperayTheme);

/** Pre-built Tamagui config using the Memorize "Quiet Dawn" theme. */
export const memorizeTamaguiConfig = createTamaguiConfig(memorizeTheme);

/**
 * Combined config for Storybook: every brand lives in ONE config, with the
 * brands registered as sub-themes (light_warmHarvest, dark_quietDawn, ...),
 * so the toolbar can switch brand/mode by changing `defaultTheme` on a
 * single provider. Swapping between the separate per-brand configs at
 * runtime cannot work: each config generates the same `.t_light` / `.t_dark`
 * theme class names, and the browser keeps the first-mounted config's
 * stylesheet, so the provider swap is a no-op and styles never change.
 */
const baseThemes = buildTamaguiThemes(baseTheme);
const warmHarvestThemes = buildTamaguiThemes(eciperayTheme);
const quietDawnThemes = buildTamaguiThemes(memorizeTheme);

export const storybookTamaguiConfig = createTamagui({
  animations,
  tokens: tamaguiTokens,
  themes: {
    ...baseThemes,
    light_warmHarvest: warmHarvestThemes.light,
    dark_warmHarvest: warmHarvestThemes.dark,
    light_quietDawn: quietDawnThemes.light,
    dark_quietDawn: quietDawnThemes.dark,
  },
});

export type StorybookThemeName =
  | "light"
  | "dark"
  | "light_warmHarvest"
  | "dark_warmHarvest"
  | "light_quietDawn"
  | "dark_quietDawn";

export default tamaguiConfig;

type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}
