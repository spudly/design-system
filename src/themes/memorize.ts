import { baseTheme } from "./base.js";

/**
 * Memorize theme. PLACEHOLDER — proves the theming mechanism only.
 * The real brand values (calm, focused study palette + font) come out of
 * the design direction step.
 */
export const memorizeTheme = {
  ...baseTheme,
  semantic: {
    ...baseTheme.semantic,
    // Calm placeholder primary (deep teal) instead of the neutral indigo.
    primary: "#0f766e",
    primaryHover: "#0d655f",
    primaryActive: "#115e59",
  },
  tokens: {
    ...baseTheme.tokens,
    typography: {
      ...baseTheme.tokens.typography,
      fontFamily: {
        ...baseTheme.tokens.typography.fontFamily,
        sans: "'Avenir Next', 'Segoe UI', sans-serif",
      },
    },
  },
} as const;

export type MemorizeTheme = typeof memorizeTheme;
