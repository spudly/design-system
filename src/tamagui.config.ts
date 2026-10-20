import { createAnimations } from "@tamagui/animations-css/extras";
// Platform constants come from Tamagui's own constants package: the
// `tamagui` entry re-exports `isWeb` but not `isAndroid`/`isIos`.
import { isAndroid, isWeb } from "@tamagui/constants";
import { createFont, createTamagui } from "tamagui";
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
 * Consumers create their app config with `createTamaguiConfig(theme)`
 * for their brand theme (eciperayTheme, memorizeTheme, or the
 * brand-neutral baseTheme) and wrap the app in
 * `<TamaguiProvider config={thatConfig}>`. Components in this package
 * reference the raw `tokens` object directly so they stay usable even
 * without the provider, while the config additionally exposes `$token`
 * shorthands for app-level styling.
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
  /** iOS family: a SINGLE font name (a CSS list is invalid there). */
  sansNative?: string | undefined;
  /** iOS per-weight face names (weight → font name), for families whose weights are separate named fonts. */
  sansNativeFaces?: Record<string, string> | undefined;
  /** Android family: a generic ("serif"/"sans-serif") — named brand families don't exist on Android. */
  sansNativeAndroid?: string | undefined;
}

/** Platforms whose font resolution differs. */
export type FontPlatform = "web" | "ios" | "android";

/** The platform this build targets, for font resolution. Any native target other than Android takes the iOS (named-family) path, as all native did before the Android split. */
const fontPlatform: FontPlatform = isWeb ? "web" : isAndroid ? "android" : "ios";

/** A resolved font registration: the family plus optional per-weight faces. */
export interface ResolvedFont {
  family: string;
  face?: Record<string, { normal: string }> | undefined;
}

/**
 * Resolve the registration for one brand on one platform. Web takes the
 * brand's full CSS fallback stack and selects weights from the stack
 * itself, so it registers no faces. iOS takes the brand's declared single
 * native name; a named family's heavier weights are separate fonts there,
 * so its declared per-weight faces register alongside. Android's stock
 * fonts are only the generics — Georgia and Avenir Next don't exist there
 * and a named registration silently falls back to the default sans — so
 * Android takes the brand's declared generic (`serif` for serif brands)
 * and resolves weights numerically: no named faces. A brand that declares
 * no native names gets the generic "sans-serif" on either native
 * platform — the native equivalent of the base stack's platform-system
 * fonts (Android resolves the generic to its system font; iOS falls back
 * to the system font for it). Pure and platform-parameterized so the
 * choice is testable without a native runtime.
 */
export function resolveFontFamily(
  fontFamily: BrandFontFamily,
  platform: FontPlatform,
): ResolvedFont {
  if (platform === "web") {
    return { family: fontFamily.sans };
  }
  if (platform === "android") {
    return { family: fontFamily.sansNativeAndroid ?? "sans-serif" };
  }
  const face = fontFamily.sansNativeFaces
    ? Object.fromEntries(
        Object.entries(fontFamily.sansNativeFaces).map(([weight, name]) => [
          weight,
          { normal: name },
        ]),
      )
    : undefined;
  return { family: fontFamily.sansNative ?? "sans-serif", ...(face ? { face } : {}) };
}

/**
 * Tamagui font registration for one brand. Registering the fonts is what
 * makes Tamagui's text-bearing primitives (Button, Input, Select, Label,
 * Text) render in the brand's stack at all: with no fonts configured they
 * fall back to platform defaults — on web, form controls don't even inherit
 * the page font — while plain text inherits, so controls and body text
 * visibly diverged (Warm Harvest body text is the serif stack; buttons
 * rendered in a browser-default sans). The registration is resolved per
 * platform (see resolveFontFamily): the brand theme's own `sans` stack on
 * web, its single `sansNative` name plus named faces on iOS, and its
 * generic `sansNativeAndroid` with numeric weights on Android;
 * size/lineHeight mirror the DS type scale (lineHeight = size × 1.5, the
 * `normal` multiplier).
 */
function buildBrandFonts(fontFamily: BrandFontFamily) {
  const { family, face } = resolveFontFamily(fontFamily, fontPlatform);
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
      sansNativeAndroid: theme.tokens?.typography?.fontFamily?.sansNativeAndroid,
    }),
    tokens: tamaguiTokens,
    themes: buildTamaguiThemes(theme),
  });
}

/**
 * NO pre-built configs are exported anymore — deliberately.
 *
 * Tamagui v3 keeps exactly ONE global config: `createTamagui()` installs
 * its result as the singleton every theme/token resolution reads, and
 * `TamaguiProvider`'s `config` prop does not change that (it only seeds
 * the default theme name and animation driver). This module used to
 * create the base, Eciperay, Memorize, and Storybook configs at module
 * scope, so merely importing the package left the LAST-created config
 * in charge of every consumer's rendering — the Eciperay app shipped
 * with Memorize teal buttons and background (spudly/eciperay#149).
 *
 * Each app must create its own config exactly once, in app-owned code
 * that evaluates after this package, via the factories:
 *
 *   const config = createTamaguiConfig(eciperayTheme); // or memorizeTheme / baseTheme
 *
 * See the changeset / migration notes for the per-app replacements of
 * the removed `tamaguiConfig`, `eciperayTamaguiConfig`, and
 * `memorizeTamaguiConfig` exports.
 */

/**
 * Build the combined config for Storybook: every brand lives in ONE
 * config, with the brands registered as sub-themes (light_warmHarvest,
 * dark_quietDawn, ...), so the toolbar can switch brand/mode by
 * changing `defaultTheme` on a single provider. Swapping between the
 * separate per-brand configs at runtime cannot work: each config
 * generates the same `.t_light` / `.t_dark` theme class names, and the
 * browser keeps the first-mounted config's stylesheet, so the
 * provider swap is a no-op and styles never change.
 *
 * A factory (not a pre-built export) for the same reason as the app
 * configs above: creating it at module scope would install it as the
 * global config for every consumer of this package. The Storybook
 * preview calls this once, in Storybook-owned code.
 */
export function createStorybookTamaguiConfig() {
  const baseThemes = buildTamaguiThemes(baseTheme);
  const warmHarvestThemes = buildTamaguiThemes(eciperayTheme);
  const quietDawnThemes = buildTamaguiThemes(memorizeTheme);

  return createTamagui({
    animations,
    // One config serves every brand, and Tamagui font families are
    // config-global, so the Storybook fonts point at the `--dsFontStack`
    // CSS var: the Storybook preview sets it on the document root from
    // the selected brand theme (see .storybook/preview.tsx) and the stack
    // switches with the theme. (Carrying the stack as a Tamagui theme
    // value instead collides with Tamagui's global variable registry
    // when several configs are created in one process, and a stack
    // string already registered as another config's font family gets
    // rewritten to that config's `--f-family` var.) The per-brand
    // configs used by the apps register the literal stack (native has
    // no CSS vars); the fallback here is the base stack for renders
    // outside the preview.
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
}

export type StorybookThemeName =
  | "light"
  | "dark"
  | "light_warmHarvest"
  | "dark_warmHarvest"
  | "light_quietDawn"
  | "dark_quietDawn";

type AppConfig = ReturnType<typeof createTamaguiConfig>;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
