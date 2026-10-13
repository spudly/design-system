import { baseTheme } from "./base.js";
import { tokens } from "../tokens/index.js";

/**
 * Memorize theme — "Quiet Dawn" visual direction (approved 2026-10-12).
 *
 * Warm paper background, deep teal primary, ink text. Gold accent is reserved
 * for progress/mastery states and used sparingly. Primary steps are chosen
 * for WCAG AA contrast (white text on primary ≥ 4.5:1).
 */
export const memorizeTheme = {
  ...baseTheme,
  semantic: {
    ...baseTheme.semantic,
    background: "#faf8f2",
    surface: "#ffffff",
    text: "#2b2620",
    textMuted: "#57534e",
    border: "#e9e2d5",
    primary: tokens.colors.teal.teal8,
    primaryHover: tokens.colors.teal.teal9,
    primaryActive: tokens.colors.teal.teal10,
    onPrimary: tokens.colors.teal.teal1,
    accent: "#b45309",
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
