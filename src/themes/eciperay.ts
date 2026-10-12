import { baseTheme } from "./base.js";

/**
 * Eciperay theme. PLACEHOLDER — proves the theming mechanism only.
 * The real brand values (warm, appetizing palette + font) come out of the
 * design direction step.
 */
export const eciperayTheme = {
  ...baseTheme,
  semantic: {
    ...baseTheme.semantic,
    // Warm placeholder primary (burnt orange) instead of the neutral indigo.
    primary: "#c2410c",
    primaryHover: "#9a3412",
    primaryActive: "#7c2d12",
  },
  tokens: {
    ...baseTheme.tokens,
    typography: {
      ...baseTheme.tokens.typography,
      fontFamily: {
        ...baseTheme.tokens.typography.fontFamily,
        sans: "Georgia, 'Times New Roman', serif",
      },
    },
  },
} as const;

export type EciperayTheme = typeof eciperayTheme;
