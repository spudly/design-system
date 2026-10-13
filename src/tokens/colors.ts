/**
 * Color palette — finalized from the approved visual directions
 * (E1 "Warm Harvest" for Eciperay, M1 "Quiet Dawn" for Memorize).
 *
 * Base ramps (gray, primary, success, warning, danger) are the neutral
 * system set. `terracotta` and `teal` are brand hues for the Eciperay and
 * Memorize themes respectively.
 *
 * Every value is a plain serializable string; no functions.
 */

/** 10-step neutral gray ramp (light → dark). */
export const gray = {
  gray1: "#fafafa",
  gray2: "#f5f5f5",
  gray3: "#e5e5e5",
  gray4: "#d4d4d4",
  gray5: "#a3a3a3",
  gray6: "#737373",
  gray7: "#525252",
  gray8: "#404040",
  gray9: "#262626",
  gray10: "#171717",
} as const;

/** 10-step primary accent ramp (light → dark). Indigo placeholder. */
export const primary = {
  primary1: "#eef2ff",
  primary2: "#e0e7ff",
  primary3: "#c7d2fe",
  primary4: "#a5b4fc",
  primary5: "#818cf8",
  primary6: "#6366f1",
  primary7: "#4f46e5",
  primary8: "#4338ca",
  primary9: "#3730a3",
  primary10: "#312e81",
} as const;

/** 10-step success ramp (light → dark). */
export const success = {
  success1: "#f0fdf4",
  success2: "#dcfce7",
  success3: "#bbf7d0",
  success4: "#86efac",
  success5: "#4ade80",
  success6: "#22c55e",
  success7: "#16a34a",
  success8: "#15803d",
  success9: "#166534",
  success10: "#14532d",
} as const;

/** 10-step warning ramp (light → dark). */
export const warning = {
  warning1: "#fffbeb",
  warning2: "#fef3c7",
  warning3: "#fde68a",
  warning4: "#fcd34d",
  warning5: "#fbbf24",
  warning6: "#f59e0b",
  warning7: "#d97706",
  warning8: "#b45309",
  warning9: "#92400e",
  warning10: "#78350f",
} as const;

/** 10-step danger ramp (light → dark). */
export const danger = {
  danger1: "#fef2f2",
  danger2: "#fee2e2",
  danger3: "#fecaca",
  danger4: "#fca5a5",
  danger5: "#f87171",
  danger6: "#ef4444",
  danger7: "#dc2626",
  danger8: "#b91c1c",
  danger9: "#991b1b",
  danger10: "#7f1d1d",
} as const;

/** 10-step terracotta ramp (light → dark). Eciperay brand hue. */
export const terracotta = {
  terracotta1: "#fff7ed",
  terracotta2: "#ffedd5",
  terracotta3: "#fed7aa",
  terracotta4: "#fdba74",
  terracotta5: "#fb923c",
  terracotta6: "#ea580c",
  terracotta7: "#c2410c",
  terracotta8: "#9a3412",
  terracotta9: "#7c2d12",
  terracotta10: "#431407",
} as const;

/** 10-step deep teal ramp (light → dark). Memorize brand hue. */
export const teal = {
  teal1: "#f0fdfa",
  teal2: "#ccfbf1",
  teal3: "#99f6e4",
  teal4: "#5eead4",
  teal5: "#2dd4bf",
  teal6: "#14b8a6",
  teal7: "#0d9488",
  teal8: "#0f766e",
  teal9: "#115e59",
  teal10: "#134e4a",
} as const;

export const colors = { gray, primary, success, warning, danger, terracotta, teal } as const;
