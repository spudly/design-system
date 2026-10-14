import { tokens, type Tokens } from "../tokens/index.js";

/**
 * Semantic color roles derived from the raw token ramps. Components should
 * reference these (via a theme), never raw ramp values, so a theme override
 * only has to remap semantics.
 */
const semantic = {
  background: tokens.colors.gray.gray1,
  surface: "#ffffff",
  text: tokens.colors.gray.gray10,
  textMuted: tokens.colors.gray.gray6,
  border: tokens.colors.gray.gray3,
  primary: tokens.colors.primary.primary7,
  primaryHover: tokens.colors.primary.primary8,
  primaryActive: tokens.colors.primary.primary9,
  onPrimary: "#ffffff",
  /** Light tint of primary for subtle backgrounds (badges, alerts). */
  primarySubtle: tokens.colors.primary.primary2,
  /** Dark primary for text on light backgrounds. */
  primaryEmphasis: tokens.colors.primary.primary8,
  /** Secondary brand accent (per-theme: sage for Eciperay, gold for Memorize). */
  accent: tokens.colors.primary.primary5,
  success: tokens.colors.success.success6,
  warning: tokens.colors.warning.warning6,
  danger: tokens.colors.danger.danger6,
} as const;

/**
 * The base (brand-neutral) theme. Per-app themes extend this and override
 * only what differs — typically the primary ramp and font family.
 */
export const baseTheme = {
  tokens: tokens satisfies Tokens,
  semantic,
} as const;

export type Theme = typeof baseTheme;
/** Widened semantic color roles (no literal types) so themes can override values. */
export type SemanticColors = { [K in keyof typeof semantic]: string };
