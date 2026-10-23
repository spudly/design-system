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
  // No token overrides: fonts come from the base tokens — Raleway
  // for headings and body in every theme (#65), replacing this
  // theme's former Georgia serif UI stack.
} as const;

export type EciperayTheme = typeof eciperayTheme;
