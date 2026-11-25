import { baseTheme } from "./base.js";
import { tokens } from "../tokens/index.js";
import { warmHarvestTagColors, warmHarvestTagColorShades } from "./tagColors.js";

/**
 * Eciperay theme — "Warm Harvest" visual direction (approved 2026-10-12).
 *
 * Warm cream surfaces, terracotta primary, espresso text. Primary steps are
 * chosen for WCAG AA contrast (white text on primary ≥ 4.5:1).
 */
export const eciperayTheme = {
  ...baseTheme,
  // Warm Harvest tag colors (#207) are the legacy app palette verbatim,
  // so existing tags render exactly as before — stated explicitly
  // (rather than inherited silently) because that identity is the
  // stored-data contract.
  tagColors: warmHarvestTagColors,
  tagColorShades: warmHarvestTagColorShades,
  semantic: {
    ...baseTheme.semantic,
    background: "#faf6f0",
    // Page surface is the visual direction's warm cream (#721
    // fidelity round, Stephen 2026-11-20): the recipe-detail
    // reference's dominant sampled color is #FBF4E8, replacing
    // the paler #fffdf8 the page rendered before.
    surface: "#FBF4E8",
    text: "#292019",
    textMuted: "#57534e",
    border: "#e9e2d5",
    // Burnt orange sampled from the visual direction's Start
    // Cooking pill (#721 fidelity round): #b13f13, replacing the
    // terracotta7 step the primary rendered before.
    primary: "#b13f13",
    primaryHover: tokens.colors.terracotta.terracotta8,
    primaryActive: tokens.colors.terracotta.terracotta9,
    onPrimary: tokens.colors.terracotta.terracotta1,
    // Footer surface (#857): matches the button color — the same
    // burnt-orange pill sampled for this theme's primary fill.
    footerBackground: "#b13f13",
    primarySubtle: tokens.colors.terracotta.terracotta2,
    // ProgressBar track stays the primarySubtle tint in Warm Harvest (#94).
    progressTrack: tokens.colors.terracotta.terracotta2,
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
