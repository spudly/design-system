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
   * must register a font under the exact name "Raleway" (a variable
   * font, so numeric weights resolve against the one family). Until
   * an app registers it, native falls back to its default sans and
   * web falls along this stack — the token contract is the name.
   */
  sans: "Raleway, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  /**
   * Single font name for React Native for the `sans` role. Native
   * `fontFamily` takes ONE font name — the CSS fallback list in `sans`
   * is invalid there. No per-weight faces are declared: apps register
   * Raleway as a variable font under the family name, so iOS/Android
   * resolve the DS weights numerically against it (the same reason
   * Android registrations carry no named faces — see
   * resolveFontFamily in tamagui.config).
   */
  sansNative: "Raleway",
  /**
   * Single font name for React Native on Android for the `sans` role:
   * the same registered "Raleway" family as iOS. (The previous
   * per-brand generics existed because Georgia / Avenir Next could
   * not be bundled by the apps; Raleway is a free Google font the
   * apps bundle deliberately, so the Android role names it too.)
   */
  sansNativeAndroid: "Raleway",
  /** Serif stack for display titles and verse/reading text (system serif). */
  serif: "Georgia, 'Times New Roman', serif",
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
