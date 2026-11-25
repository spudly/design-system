import { baseTheme } from "./base.js";
import { tokens } from "../tokens/index.js";
import { quietDawnTagColors, quietDawnTagColorShades } from "./tagColors.js";

/**
 * Memorize theme — "Quiet Dawn" visual direction (approved 2026-10-12).
 *
 * Warm paper background (brief M1 Quiet Dawn, #faf8f2), deep teal primary, ink text. Gold accent is reserved
 * for progress/mastery states and used sparingly. Primary steps are chosen
 * for WCAG AA contrast (white text on primary ≥ 4.5:1).
 */
export const memorizeTheme = {
  ...baseTheme,
  // Quiet Dawn tag colors (#207): cooler, muted shades of the twelve
  // tag color names, distinct from Warm Harvest's legacy palette.
  tagColors: quietDawnTagColors,
  tagColorShades: quietDawnTagColorShades,
  semantic: {
    ...baseTheme.semantic,
    // The design brief's warm paper (#849, Stephen's brief-wins
    // call 2026-11-25): Quiet Dawn's background is the brief's
    // #faf8f2, superseding the cool dawn tint #68 introduced so the
    // two themes would not share near-identical warm off-whites —
    // Stephen accepted that sameness when he approved the brief
    // value. The border warms with it (the warm sand #e9e2d5).
    // Ink text and muted text keep AA+ contrast on it, and the white
    // surface stays distinguishable from the background.
    background: "#faf8f2",
    surface: "#ffffff",
    text: "#2b2620",
    textMuted: "#57534e",
    border: "#e9e2d5",
    primary: tokens.colors.teal.teal8,
    primaryHover: tokens.colors.teal.teal9,
    primaryActive: tokens.colors.teal.teal10,
    onPrimary: tokens.colors.teal.teal1,
    // Without these two the ghost button, Badge/Alert info tones and
    // Avatar fallback silently fell back to the base (indigo) ramp under
    // Quiet Dawn. Steps parallel the other themes: subtle = step 2 tint,
    // emphasis = the primaryHover step (dark primary for text on light).
    primarySubtle: tokens.colors.teal.teal2,
    // ProgressBar track (#94, Stephen's call 2026-10-23): in Quiet
    // Dawn LIGHT the bar's second color is a light gray, not the
    // teal primarySubtle tint (#ccfbf1 reads light blue next to the
    // teal fill). Scoped to the progressTrack role so Badge, Avatar,
    // Alert and the ghost button keep their teal tint. Fill
    // (teal8) on gray3 keeps ≥3:1 WCAG non-text contrast (~4.8:1,
    // same class as the old tint). Dark mode is unchanged: the dark
    // semantic derives its track from primarySubtle, not this value
    // (buildTamaguiThemes) — Stephen's request was light-only.
    progressTrack: tokens.colors.gray.gray3,
    primaryEmphasis: tokens.colors.teal.teal9,
    link: tokens.colors.teal.teal8,
    linkDark: tokens.colors.teal.teal6,
    accent: "#b45309",
  },
  // UI fonts come from the base tokens — Raleway for headings and
  // body in every theme (#65), replacing this theme's former Avenir
  // Next UI stack. Verse text is the one exception (#66): only the
  // `verse` role is overridden, to Alegreya — a reading serif
  // bundled by the Memorize app under that exact family name (web
  // surfaces load it from Google Fonts; the Storybook preview-head
  // does). Everything else in the typography tokens is inherited.
  tokens: {
    ...tokens,
    typography: {
      ...tokens.typography,
      fontFamily: {
        ...tokens.typography.fontFamily,
        verse: "Alegreya, Georgia, 'Times New Roman', serif",
        verseNative: "Alegreya",
        verseNativeAndroid: "Alegreya",
      },
    },
  },
} as const;

export type MemorizeTheme = typeof memorizeTheme;
