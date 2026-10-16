import { createAnimations } from "@tamagui/animations-css/extras";
import { createFont, createTamagui, isWeb } from "tamagui";
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

/** The font-family shape a brand theme contributes (all fields but `sans` optional). */
interface BrandFontFamily {
  /** Web family: a full CSS fallback stack. */
  sans: string;
  /** React Native family: a SINGLE font name (a CSS list is invalid there). */
  sansNative?: string | undefined;
  /** Native per-weight face names (weight → font name), for families whose weights are separate named fonts. */
  sansNativeFaces?: Record<string, string> | undefined;
}

/**
 * Resolve the family to register for one brand on one platform. Web takes
 * the brand's full CSS fallback stack. React Native's `fontFamily` accepts
 * a single font name only, so native takes the brand's declared native
 * name; a brand that declares none gets the generic "sans-serif" — the
 * native equivalent of the base stack's platform-system fonts (Android
 * resolves the generic to its system font; iOS falls back to the system
 * font for it). Pure and platform-parameterized so the choice is testable
 * without a native runtime.
 */
export function resolveFontFamily(
  stack: string,
  nativeFamily: string | undefined,
  web: boolean,
): string {
  if (web) return stack;
  return nativeFamily ?? "sans-serif";
}

/**
 * Tamagui font registration for one brand. Registering the fonts is what
 * makes Tamagui's text-bearing primitives (Button, Input, Select, Label,
 * Text) render in the brand's stack at all: with no fonts configured they
 * fall back to platform defaults — on web, form controls don't even inherit
 * the page font — while plain text inherits, so controls and body text
 * visibly diverged (Warm Harvest body text is the serif stack; buttons
 * rendered in a browser-default sans). The family is the brand theme's own
 * `sans` stack on web and its single `sansNative` name on React Native
 * (see resolveFontFamily); size/lineHeight mirror the DS type scale
 * (lineHeight = size × 1.5, the `normal` multiplier).
 */
function buildBrandFonts(fontFamily: BrandFontFamily) {
  const family = resolveFontFamily(fontFamily.sans, fontFamily.sansNative, isWeb);
  // Per-weight faces exist only on native: a named family's heavier
  // weights are separate fonts there, while web selects weights from the
  // stack itself. Keeping `face` out of the web registration leaves the
  // web font object exactly as it was before native support.
  const face =
    !isWeb && fontFamily.sansNativeFaces
      ? Object.fromEntries(
          Object.entries(fontFamily.sansNativeFaces).map(([weight, name]) => [
            weight,
            { normal: name },
          ]),
        )
      : undefined;
  const font = createFont({
    family,
    ...(face ? { face } : {}),
    size: {
      1: tokens.typography.fontSize.xs,
      2: tokens.typography.fontSize.sm,
      3: tokens.typography.fontSize.md,
      4: tokens.typography.fontSize.lg,
      5: tokens.typography.fontSize.xl,
      6: tokens.typography.fontSize["2xl"],
      7: tokens.typography.fontSize["3xl"],
      8: tokens.typography.fontSize["4xl"],
    },
    lineHeight: {
      1: 18,
      2: 21,
      3: 24,
      4: 27,
      5: 30,
      6: 36,
      7: 45,
      8: 54,
    },
    weight: {
      1: String(tokens.typography.fontWeight.regular),
      2: String(tokens.typography.fontWeight.medium),
      3: String(tokens.typography.fontWeight.semibold),
      4: String(tokens.typography.fontWeight.bold),
    },
  });
  // Headings use the same stack: hierarchy in this system is carried by
  // size/weight (the DS Text heading variants set no family of their own).
  return { body: font, heading: font };
}

export function createTamaguiConfig(theme: {
  semantic: SemanticColors;
  tokens?: { typography: { fontFamily: BrandFontFamily } };
}) {
  return createTamagui({
    animations,
    // The font override is optional: callers that pass a semantic-only
    // theme (the factory's original input shape) get the base font stack
    // instead of a dereference error. The native fields fall back the
    // same way (resolveFontFamily's generic when a theme declares none).
    fonts: buildBrandFonts({
      sans:
        theme.tokens?.typography?.fontFamily?.sans ?? baseTheme.tokens.typography.fontFamily.sans,
      sansNative: theme.tokens?.typography?.fontFamily?.sansNative,
      sansNativeFaces: theme.tokens?.typography?.fontFamily?.sansNativeFaces,
    }),
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
  // One config serves every brand, and Tamagui font families are
  // config-global, so the Storybook fonts point at the `--dsFontStack`
  // CSS var: the Storybook preview sets it on the document root from the
  // selected brand theme (see .storybook/preview.tsx) and the stack
  // switches with the theme. (Carrying the stack as a Tamagui theme value
  // instead collides with Tamagui's global variable registry: all four
  // configs are created in one process, and a stack string already
  // registered as another config's font family gets rewritten to that
  // config's `--f-family` var.) The per-brand configs used by the apps
  // register the literal stack (native has no CSS vars); the fallback here
  // is the base stack for renders outside the preview.
  fonts: buildBrandFonts({
    sans: `var(--dsFontStack, ${baseTheme.tokens.typography.fontFamily.sans})`,
  }),
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
