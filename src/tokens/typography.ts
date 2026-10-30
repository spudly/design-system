/**
 * Typography tokens — finalized per the approved visual directions.
 * UI type (headings and body) is Raleway in every theme (#65); the
 * `serif` role remains for verse/reading text (the deliberate
 * exception — Memorize verse text gets its own family in #66).
 *
 * Every value is a plain serializable string or number; no functions.
 */
export const fontFamily = {
  /**
   * Default UI font stack: Raleway first, platform system fonts as
   * fallbacks for surfaces that have not loaded/bundled Raleway yet.
   * Raleway is not a stock font on any platform: web surfaces load it
   * (Google Fonts — the Storybook preview-head does), and native apps
   * register the static per-weight faces named in `sansNativeFaces` /
   * `sansNativeAndroidFaces` below. Until an app registers them,
   * native falls back to its default sans and web falls along this
   * stack — the token contract is the names.
   */
  sans: "Raleway, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  /**
   * Single font name for React Native for the `sans` role. Native
   * `fontFamily` takes ONE font name — the CSS fallback list in `sans`
   * is invalid there.
   */
  sansNative: "Raleway",
  /**
   * iOS per-weight face names (weight → font name) for the `sans`
   * role: native apps register one STATIC font per DS weight under
   * these exact names, and Tamagui selects the face for a text's
   * weight instead of asking the platform to resolve the weight
   * numerically (see resolveFontFamily in tamagui.config).
   *
   * Why static faces, not one variable font: the bundled Raleway
   * variable font's own default instance is its Thin (100) weight,
   * so every DS weight asked the platform to instantiate the
   * variable font at a non-default weight — and Android's numeric
   * resolution of the medium (500) weight proved nondeterministic
   * across app launches, rendering the same medium text (the public
   * frame's sign-in and footer links) in two different weights from
   * launch to launch (#326). A static face can only render its own
   * weight, so face selection is deterministic by construction.
   */
  sansNativeFaces: {
    "400": "Raleway",
    "500": "Raleway-Medium",
    "600": "Raleway-SemiBold",
    "700": "Raleway-Bold",
  },
  /**
   * Single font name for React Native on Android for the `sans` role:
   * the same registered "Raleway" family as iOS. (The previous
   * per-brand generics existed because Georgia / Avenir Next could
   * not be bundled by the apps; Raleway is a free Google font the
   * apps bundle deliberately, so the Android role names it too.)
   */
  sansNativeAndroid: "Raleway",
  /**
   * Android per-weight face names for the `sans` role: the same
   * static faces as iOS (see `sansNativeFaces` for why). Android
   * registrations carried no named faces until #326 — numeric weight
   * resolution against the variable font is exactly what flipped.
   */
  sansNativeAndroidFaces: {
    "400": "Raleway",
    "500": "Raleway-Medium",
    "600": "Raleway-SemiBold",
    "700": "Raleway-Bold",
  },
  /** Serif stack for display titles and verse/reading text (system serif). */
  serif: "Georgia, 'Times New Roman', serif",
  /**
   * Verse/reading-text stack: the family `VerseText` and the Text
   * `verse` variant render in, resolved through the registered
   * Tamagui `verse` font (see tamagui.config). The base role is the
   * serif stack; a theme may override it in its own tokens — Quiet
   * Dawn (Memorize) sets Alegreya (#66) — so apps mark verse text
   * with the component/variant and never name a family themselves.
   */
  verse: "Georgia, 'Times New Roman', serif",
  /** Single font name for React Native for the `verse` role. */
  verseNative: "Georgia",
  /** Single font name for React Native on Android for the `verse` role. */
  verseNativeAndroid: "serif",
  /** Monospace stack for code / tabular content. */
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

/** Type scale in px. */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

/** Font weights. */
export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Line heights (unitless multipliers). */
export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const typography = { fontFamily, fontSize, fontWeight, lineHeight } as const;
