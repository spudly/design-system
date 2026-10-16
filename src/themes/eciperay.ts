import { baseTheme } from "./base.js";
import { tokens } from "../tokens/index.js";

/**
 * Eciperay theme — "Warm Harvest" visual direction (approved 2026-10-12).
 *
 * Warm cream surfaces, terracotta primary, espresso text. Primary steps are
 * chosen for WCAG AA contrast (white text on primary ≥ 4.5:1).
 */
export const eciperayTheme = {
  ...baseTheme,
  semantic: {
    ...baseTheme.semantic,
    background: "#faf6f0",
    surface: "#fffdf8",
    text: "#292019",
    textMuted: "#57534e",
    border: "#e9e2d5",
    primary: tokens.colors.terracotta.terracotta7,
    primaryHover: tokens.colors.terracotta.terracotta8,
    primaryActive: tokens.colors.terracotta.terracotta9,
    onPrimary: tokens.colors.terracotta.terracotta1,
    primarySubtle: tokens.colors.terracotta.terracotta2,
    primaryEmphasis: tokens.colors.terracotta.terracotta8,
    link: tokens.colors.terracotta.terracotta8,
    linkDark: tokens.colors.terracotta.terracotta5,
    accent: "#5f6f52",
  },
  tokens: {
    ...baseTheme.tokens,
    typography: {
      ...baseTheme.tokens.typography,
      fontFamily: {
        ...baseTheme.tokens.typography.fontFamily,
        // System serif for display type (custom serif deferred — see design brief).
        sans: "Georgia, 'Times New Roman', serif",
        // Native takes a single name (the stack's head). Georgia ships on
        // both mobile platforms; its semibold/bold face is the separate
        // named font Georgia-Bold, mapped per weight so native text at
        // the DS semibold/bold weights renders in the real bold face.
        sansNative: "Georgia",
        sansNativeFaces: {
          "600": "Georgia-Bold",
          "700": "Georgia-Bold",
        },
      },
    },
  },
} as const;

export type EciperayTheme = typeof eciperayTheme;
