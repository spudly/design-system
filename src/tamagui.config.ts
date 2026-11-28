/* eslint-disable max-lines -- single declarative configuration object; splitting it would fragment one config definition (#902 T4) */
import { createAnimations } from "@tamagui/animations-css/extras";
// Platform constants come from Tamagui's own constants package: the
// `tamagui` entry re-exports `isWeb` but not `isAndroid`/`isIos`.
import { isAndroid, isWeb } from "@tamagui/constants";
import { createFont, createTamagui } from "tamagui";

import { tokens } from "./tokens/index.js";
import { baseTheme, eciperayTheme, memorizeTheme, type SemanticColors } from "./themes/index.js";
import {
  tagColorNames,
  tagColorShadeThemeKey,
  warmHarvestTagColorShades,
  warmHarvestTagColors,
  type TagColorShades,
  type TagColorValues,
} from "./themes/tagColors.js";

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
function toTamaguiTheme(
  semantic: SemanticColors,
  dark: boolean,
  tagColors: TagColorValues,
  tagColorShades: TagColorShades = warmHarvestTagColorShades,
) {
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
    footerBackground: semantic.footerBackground,
    primaryHover: semantic.primaryHover,
    primaryActive: semantic.primaryActive,
    onPrimary: semantic.onPrimary,
    primarySubtle: semantic.primarySubtle,
    progressTrack: semantic.progressTrack,
    primaryEmphasis: semantic.primaryEmphasis,
    link: semantic.link,
    errorText: semantic.errorText,
    accent: semantic.accent,
    surface: semantic.surface,
    textMuted: semantic.textMuted,
    success: semantic.success,
    warning: semantic.warning,
    danger: semantic.danger,
    // Named tag colors (#207), registered under tagColorThemeKey(name)
    // so components resolve the active theme's shade for a tag color
    // name. The same values serve light and dark: tag colors were
    // mode-independent hexes before they were tokens.
    tagIndigo: tagColors.indigo,
    tagRed: tagColors.red,
    tagOrange: tagColors.orange,
    tagAmber: tagColors.amber,
    tagLime: tagColors.lime,
    tagGreen: tagColors.green,
    tagTeal: tagColors.teal,
    tagCyan: tagColors.cyan,
    tagBlue: tagColors.blue,
    tagPurple: tagColors.purple,
    tagPink: tagColors.pink,
    tagGray: tagColors.gray,
    // Tag dark/light shades (#799), registered under
    // tagColorShadeThemeKey(name, shade) so Badge's inverted tag
    // form resolves the active theme's pair.
    ...Object.fromEntries(
      tagColorNames.flatMap((name) => [
        [tagColorShadeThemeKey(name, "dark"), tagColorShades[name].dark],
        [tagColorShadeThemeKey(name, "light"), tagColorShades[name].light],
      ]),
    ),
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
function buildTamaguiThemes(theme: {
  semantic: SemanticColors;
  tagColors?: TagColorValues;
  tagColorShades?: TagColorShades;
}) {
  // A semantic-only caller (the factory's original input shape) gets
  // the canonical palette — the Warm Harvest tag values.
  const tagColors = theme.tagColors ?? warmHarvestTagColors;
  const tagColorShades = theme.tagColorShades ?? warmHarvestTagColorShades;
  const darkSemantic: SemanticColors = {
    background: tokens.colors.gray.gray10,
    surface: tokens.colors.gray.gray9,
    text: tokens.colors.gray.gray1,
    textMuted: tokens.colors.gray.gray5,
    border: tokens.colors.gray.gray7,
    primary: theme.semantic.primary,
    footerBackground: theme.semantic.footerBackground,
    primaryHover: theme.semantic.primaryHover,
    primaryActive: theme.semantic.primaryActive,
    onPrimary: theme.semantic.onPrimary,
    primarySubtle: theme.semantic.primarySubtle,
    // Dark progress tracks keep the primarySubtle tint even when the
    // light theme overrides progressTrack (#94 was a light-only call).
    progressTrack: theme.semantic.primarySubtle,
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
    light: toTamaguiTheme(theme.semantic, false, tagColors, tagColorShades),
    dark: toTamaguiTheme(darkSemantic, true, tagColors, tagColorShades),
  };
}

/** The font-family shape a brand theme contributes (all fields but `sans` optional). */
type BrandFontFamily = {
  /** Web family: a full CSS fallback stack. */
  sans: string;
  /** iOS family: a SINGLE font name (a CSS list is invalid there). */
  sansNative?: string | undefined;
  /** iOS per-weight face names (weight → font name), for families whose weights are separate named fonts. */
  sansNativeFaces?: Record<string, string> | undefined;
  /** Android family: a SINGLE font name — the family the app registers on Android (UiSans, the renamed Raleway instances, #65/#326), or a generic for a theme that declares none. */
  sansNativeAndroid?: string | undefined;
  /** Android per-weight face names (weight → font name), for families whose weights are separate named fonts (the static UiSans faces, #326). */
  sansNativeAndroidFaces?: Record<string, string> | undefined;
  /** Verse/reading-text web family: a full CSS fallback stack (the base serif stack when a theme declares none; Alegreya under Quiet Dawn, #66). */
  verse?: string | undefined;
  /** Verse iOS family: a SINGLE font name. */
  verseNative?: string | undefined;
  /** Verse Android family: a SINGLE font name. */
  verseNativeAndroid?: string | undefined;
  /** Display/title web family: a full CSS fallback stack (mirrors the `sans` stack when a theme declares none; the serif stack under Warm Harvest, #851). */
  display?: string | undefined;
  /** Display iOS family: a SINGLE font name. */
  displayNative?: string | undefined;
  /** Display iOS per-weight face names (weight → font name). */
  displayNativeFaces?: Record<string, string> | undefined;
  /** Display Android family: a SINGLE font name. */
  displayNativeAndroid?: string | undefined;
  /** Display Android per-weight face names (weight → font name). */
  displayNativeAndroidFaces?: Record<string, string> | undefined;
};

/**
 * Display-role title weight steps a brand theme may override, as
 * CSS weight values: the registered `display` font's weight scale
 * takes these for its semibold/bold slots (the steps the
 * title-bearing Text variants reference) instead of the theme's
 * `displayFontWeight` token defaults. A number is a literal weight;
 * the Storybook config passes `var(--dsDisplayWeight…, fallback)`
 * strings so its preview can switch the steps per brand, exactly
 * as it switches the display family stack.
 */
type BrandDisplayFontWeight = {
  semibold?: string | number | undefined;
  bold?: string | number | undefined;
};

/** Platforms whose font resolution differs. */
type FontPlatform = "web" | "ios" | "android";

/** The platform this build targets, for font resolution. Any native target other than Android takes the iOS (named-family) path, as all native did before the Android split. */
const fontPlatform: FontPlatform = isWeb ? "web" : isAndroid ? "android" : "ios";

/** A resolved font registration: the family plus optional per-weight faces. */
type ResolvedFont = {
  family: string;
  face?: Record<string, { normal: string }> | undefined;
};

/** Map a theme's declared per-weight face names to Tamagui's face shape. */
function toFaces(
  faces: Record<string, string> | undefined,
): Record<string, { normal: string }> | undefined {
  return faces
    ? Object.fromEntries(
        Object.entries(faces).map(([weight, name]) => [weight, { normal: name }]),
      )
    : undefined;
}

/**
 * Resolve the registration for one brand on one platform. Web takes the
 * brand's full CSS fallback stack and selects weights from the stack
 * itself, so it registers no faces. Each native platform takes the
 * brand's declared single native name plus its declared per-weight
 * faces: a named family's weights are separate static fonts, so the
 * faces register alongside and Tamagui picks the face per weight
 * instead of leaving the weight to the platform's numeric resolution.
 * Android carried no faces until #326, when its numeric resolution of
 * the medium weight against the Raleway variable font proved
 * nondeterministic across app launches (the same text rendered in two
 * weights from launch to launch); a theme that declares no Android
 * faces still resolves its Android weights numerically. Since #65
 * every theme's UI typeface is Raleway — named directly on web,
 * where the unmodified font loads under its own name, and as
 * UiSans on native, where the bundled instances are modified
 * versions the OFL's Reserved Font Name rule keeps from carrying
 * the Raleway name — a family the apps register deliberately (it is not a stock font; an unregistered
 * name silently falls back to the platform default sans, which is the
 * pre-registration state, not a different design). A brand that
 * declares no native names gets the generic "sans-serif" on either
 * native platform. Pure and platform-parameterized so the choice is
 * testable without a native runtime.
  * @public — intentional exception (#586 phase 2): exercised directly by tests through internal module/dist imports that knip cannot trace; not part of the package's public entry.
 */
export function resolveFontFamily(
  fontFamily: BrandFontFamily,
  platform: FontPlatform,
): ResolvedFont {
  if (platform === "web") {
    return { family: fontFamily.sans };
  }
  if (platform === "android") {
    const face = toFaces(fontFamily.sansNativeAndroidFaces);
    return {
      family: fontFamily.sansNativeAndroid ?? "sans-serif",
      ...(face ? { face } : {}),
    };
  }
  const face = toFaces(fontFamily.sansNativeFaces);
  return { family: fontFamily.sansNative ?? "sans-serif", ...(face ? { face } : {}) };
}

/**
 * Tamagui font registration for one brand. Registering the fonts is what
 * makes Tamagui's text-bearing primitives (Button, Input, Select, Label,
 * Text) render in the brand's stack at all: with no fonts configured they
 * fall back to platform defaults — on web, form controls don't even inherit
 * the page font — while plain text inherits, so controls and body text
 * visibly diverged (body text in the theme stack; buttons rendered in a
 * browser-default sans). The registration is resolved per
 * platform (see resolveFontFamily): the brand theme's own `sans` stack on
 * web, and on each native platform its single native name plus any
 * named per-weight faces it declares;
 * size/lineHeight mirror the DS type scale (lineHeight = size × 1.5, the
 * `normal` multiplier).
 */
function buildBrandFonts(fontFamily: BrandFontFamily, displayFontWeight?: BrandDisplayFontWeight) {
  // One scale for every registered font: size/lineHeight/weight mirror
  // the DS type scale (lineHeight = size × 1.5, the `normal`
  // multiplier), whatever family the font carries.
  const scale = {
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
  } as const;
  const { family, face } = resolveFontFamily(fontFamily, fontPlatform);
  const font = createFont({
    family,
    ...(face ? { face } : {}),
    ...scale,
  });
  // The verse font (#66): same registration mechanism, resolved from
  // the theme's `verse` role — the base serif stack when a theme
  // declares none, Alegreya under Quiet Dawn. VerseText and the Text
  // `verse` variant reference it as `$verse`, so the family follows
  // the app's brand config instead of a package-global literal.
  const verseResolved = resolveFontFamily(
    {
      sans: fontFamily.verse ?? tokens.typography.fontFamily.verse,
      sansNative: fontFamily.verseNative,
      sansNativeAndroid: fontFamily.verseNativeAndroid,
    },
    fontPlatform,
  );
  const verse = createFont({
    family: verseResolved.family,
    ...(verseResolved.face ? { face: verseResolved.face } : {}),
    ...scale,
  });
  // The display font (#851): same registration mechanism, resolved
  // from the theme's `display` role — the base role mirrors the
  // `sans` stack, and Warm Harvest overrides it to the serif stack,
  // so Eciperay page/recipe titles render serif while every other
  // brand's titles keep the UI sans. The title-bearing Text
  // variants reference it as `$display`, and Tamagui's `heading`
  // font IS the display font, so headed primitives follow the
  // brand's title treatment too.
  const displayResolved = resolveFontFamily(
    {
      sans: fontFamily.display ?? tokens.typography.fontFamily.display,
      sansNative: fontFamily.displayNative,
      sansNativeFaces: fontFamily.displayNativeFaces,
      sansNativeAndroid: fontFamily.displayNativeAndroid,
      sansNativeAndroidFaces: fontFamily.displayNativeAndroidFaces,
    },
    fontPlatform,
  );
  const display = createFont({
    family: displayResolved.family,
    ...(displayResolved.face ? { face: displayResolved.face } : {}),
    ...scale,
    // The display font's weight scale is the one scale that may
    // depart from the shared steps: its semibold/bold slots (the
    // steps the title-bearing Text variants reference) come from
    // the brand's `displayFontWeight` tokens, so a brand whose
    // display family renders the standard steps too heavily (Warm
    // Harvest's Georgia serif, #851) carries lighter title weights
    // in its tokens and the titles follow — no component names a
    // per-theme weight. The regular/medium slots and every other
    // font keep the shared scale.
    weight: {
      1: String(tokens.typography.fontWeight.regular),
      2: String(tokens.typography.fontWeight.medium),
      3: String(displayFontWeight?.semibold ?? tokens.typography.displayFontWeight.semibold),
      4: String(displayFontWeight?.bold ?? tokens.typography.displayFontWeight.bold),
    },
  });
  return { body: font, heading: display, verse, display };
}

export function createTamaguiConfig(theme: {
  semantic: SemanticColors;
  tagColors?: TagColorValues;
  tagColorShades?: TagColorShades;
  tokens?: {
    typography: { fontFamily: BrandFontFamily; displayFontWeight?: BrandDisplayFontWeight };
  };
}) {
  return createTamagui({
    animations,
    // The font override is optional: callers that pass a semantic-only
    // theme (the factory's original input shape) get the base font stack
    // instead of a dereference error. The native fields fall back the
    // same way (resolveFontFamily's generic when a theme declares none).
    fonts: buildBrandFonts(
      {
        sans:
          theme.tokens?.typography?.fontFamily?.sans ?? baseTheme.tokens.typography.fontFamily.sans,
        sansNative: theme.tokens?.typography?.fontFamily?.sansNative,
        sansNativeFaces: theme.tokens?.typography?.fontFamily?.sansNativeFaces,
        sansNativeAndroid: theme.tokens?.typography?.fontFamily?.sansNativeAndroid,
        sansNativeAndroidFaces: theme.tokens?.typography?.fontFamily?.sansNativeAndroidFaces,
        verse: theme.tokens?.typography?.fontFamily?.verse,
        verseNative: theme.tokens?.typography?.fontFamily?.verseNative,
        verseNativeAndroid: theme.tokens?.typography?.fontFamily?.verseNativeAndroid,
        display: theme.tokens?.typography?.fontFamily?.display,
        displayNative: theme.tokens?.typography?.fontFamily?.displayNative,
        displayNativeFaces: theme.tokens?.typography?.fontFamily?.displayNativeFaces,
        displayNativeAndroid: theme.tokens?.typography?.fontFamily?.displayNativeAndroid,
        displayNativeAndroidFaces: theme.tokens?.typography?.fontFamily?.displayNativeAndroidFaces,
      },
      // The brand's display title weight steps (#851): the theme's
      // displayFontWeight tokens, forwarded so the registered
      // display font's weight scale carries them.
      theme.tokens?.typography?.displayFontWeight,
    ),
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
      // Same CSS-var mechanism for the verse font (#66): the preview
      // sets `--dsVerseFontStack` from the selected brand (Alegreya
      // under Quiet Dawn, the base serif stack otherwise).
      verse: `var(--dsVerseFontStack, ${baseTheme.tokens.typography.fontFamily.verse})`,
      // Same CSS-var mechanism for the display font (#851): the
      // preview sets `--dsDisplayFontStack` from the selected brand
      // (the serif stack under Warm Harvest, the sans stack
      // otherwise).
      display: `var(--dsDisplayFontStack, ${baseTheme.tokens.typography.fontFamily.display})`,
    }, {
      // Same CSS-var mechanism for the display font's title weight
      // steps (#851): the preview sets `--dsDisplayWeightSemibold` /
      // `--dsDisplayWeightBold` from the selected brand's
      // displayFontWeight tokens (the lighter steps under Warm
      // Harvest, the standard steps otherwise).
      semibold: `var(--dsDisplayWeightSemibold, ${tokens.typography.displayFontWeight.semibold})`,
      bold: `var(--dsDisplayWeightBold, ${tokens.typography.displayFontWeight.bold})`,
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

/**
 * Build the combined config for the ON-DEVICE Storybook (#43): the same
 * one-config / brands-as-sub-themes structure as
 * createStorybookTamaguiConfig (runtime config swapping cannot restyle —
 * see its note), but with fonts registered the native way instead of
 * through the web preview's CSS vars, which do not exist on device.
 *
 * Body/heading: every brand's UI stack is the UiSans family (static
 * Raleway instances, renamed per the OFL Reserved Font Name) on
 * native (#65), and
 * the host app registers the static per-weight faces under the exact
 * names the tokens declare, so the registration passes the base
 * family's native names and faces through resolveFontFamily — on
 * Android that resolves to the registered UiSans faces, exactly as
 * the per-brand app configs resolve them.
 *
 * Verse: fonts are config-global, so the one registered verse family
 * must serve every brand. Quiet Dawn's Alegreya is registered (the
 * host app bundles it under the exact name "Alegreya"): Quiet Dawn is
 * the brand whose surfaces actually ship verse text (Memorize), and its
 * app config resolves verse to Alegreya the same way. The cost is a
 * documented deviation — under Base / Warm Harvest, verse-role text in
 * the on-device Storybook renders in Alegreya where the apps resolve
 * the generic "serif" on Android. No Warm Harvest surface ships verse
 * text today, and layout (the native-only defect class #43 exists to
 * catch) is unaffected beyond the verse passages themselves.
 */
export function createOnDeviceStorybookTamaguiConfig() {
  const baseThemes = buildTamaguiThemes(baseTheme);
  const warmHarvestThemes = buildTamaguiThemes(eciperayTheme);
  const quietDawnThemes = buildTamaguiThemes(memorizeTheme);

  return createTamagui({
    animations,
    fonts: buildBrandFonts({
      sans: baseTheme.tokens.typography.fontFamily.sans,
      sansNative: baseTheme.tokens.typography.fontFamily.sansNative,
      sansNativeFaces: baseTheme.tokens.typography.fontFamily.sansNativeFaces,
      sansNativeAndroid: baseTheme.tokens.typography.fontFamily.sansNativeAndroid,
      sansNativeAndroidFaces: baseTheme.tokens.typography.fontFamily.sansNativeAndroidFaces,
      verse: memorizeTheme.tokens.typography.fontFamily.verse,
      verseNative: memorizeTheme.tokens.typography.fontFamily.verseNative,
      verseNativeAndroid: memorizeTheme.tokens.typography.fontFamily.verseNativeAndroid,
      // Display: fonts are config-global, so the on-device config
      // registers the BASE display role (the UI sans, with its
      // static faces and its base title weight steps) for every
      // brand — the same documented deviation class as verse
      // below, in the safe direction:
      // Warm Harvest titles render sans on device Storybook where
      // the Eciperay app config resolves them serif (#851), and no
      // brand's titles take another brand's serif.
      display: baseTheme.tokens.typography.fontFamily.display,
      displayNative: baseTheme.tokens.typography.fontFamily.displayNative,
      displayNativeFaces: baseTheme.tokens.typography.fontFamily.displayNativeFaces,
      displayNativeAndroid: baseTheme.tokens.typography.fontFamily.displayNativeAndroid,
      displayNativeAndroidFaces: baseTheme.tokens.typography.fontFamily.displayNativeAndroidFaces,
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
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/consistent-type-definitions -- declaration merging requires the interface form here; the type-alias conversion breaks Tamagui's own TamaguiCustomConfig interface (TS2300).
  interface TamaguiCustomConfig extends AppConfig {}
}
