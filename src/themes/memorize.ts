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
    // Without these two the ghost button, Badge/InlineAlert info tones and
    // Avatar fallback silently fell back to the base (indigo) ramp under
    // Quiet Dawn. Steps parallel the other themes: subtle = step 2 tint,
    // emphasis = the primaryHover step (dark primary for text on light).
    primarySubtle: tokens.colors.teal.teal2,
    primaryEmphasis: tokens.colors.teal.teal9,
    link: tokens.colors.teal.teal8,
    linkDark: tokens.colors.teal.teal6,
    accent: "#b45309",
  },
  tokens: {
    ...baseTheme.tokens,
    typography: {
      ...baseTheme.tokens.typography,
      fontFamily: {
        ...baseTheme.tokens.typography.fontFamily,
        sans: "'Avenir Next', 'Segoe UI', sans-serif",
        // Native takes a single name (the stack's head). Avenir Next is an
        // iOS system family; its weights are separate named fonts, mapped
        // per weight below.
        sansNative: "Avenir Next",
        sansNativeFaces: {
          "500": "AvenirNext-Medium",
          "600": "AvenirNext-DemiBold",
          "700": "AvenirNext-Bold",
        },
        // Android has no Avenir Next: the generic sans-serif (numeric
        // weights, no named faces) is the deliberate Android resolution,
        // not a missing-family fallback.
        sansNativeAndroid: "sans-serif",
      },
    },
  },
} as const;

export type MemorizeTheme = typeof memorizeTheme;
