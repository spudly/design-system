/**
 * Typography tokens. PLACEHOLDER values — the design direction will finalize
 * the type scale and font families.
 *
 * Every value is a plain serializable string or number; no functions.
 */
export const fontFamily = {
  /** Default UI font stack (system). */
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
