/**
 * Typography tokens — finalized per the approved visual directions
 * (serif display/verse type for Eciperay + Memorize, system sans for UI).
 *
 * Every value is a plain serializable string or number; no functions.
 */
export const fontFamily = {
  /** Default UI font stack (system). */
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  /**
   * Single font name for React Native for the `sans` role. Native
   * `fontFamily` takes ONE font name — the CSS fallback list in `sans` is
   * invalid there. The base stack is entirely platform system fonts, so
   * the native equivalent is the generic "sans-serif": Android resolves it
   * to its system font (Roboto), and iOS falls back to the system font
   * for the generic name — the platform system font either way, which is
   * exactly what the web stack targets. Brands whose stack names a real
   * family override this with that family (and optional per-weight faces
   * in `sansNativeFaces`).
   */
  sansNative: "sans-serif",
  /**
   * Single font name for React Native on Android for the `sans` role.
   * Android's stock fonts are only the generics ("sans-serif", "serif",
   * "monospace") — named families like Georgia or Avenir Next don't exist
   * there, so registering one silently falls back to the default sans and
   * a serif brand loses its serif typography entirely. The generic keeps
   * the brand's serif/sans character, and Android resolves numeric
   * fontWeight against it, so Android registrations carry NO named faces
   * (see resolveFontFamily in tamagui.config). The base brand is
   * platform-system sans on every platform, hence "sans-serif".
   */
  sansNativeAndroid: "sans-serif",
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
