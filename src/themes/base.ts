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
  primary: tokens.colors.primary.primary6,
  primaryHover: tokens.colors.primary.primary7,
  primaryActive: tokens.colors.primary.primary8,
  onPrimary: "#ffffff",
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
