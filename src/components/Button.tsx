import { Button as TamaguiButton, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledButton = styled(TamaguiButton, {
  name: "SpudlyButton",

  // Base: theme-aware styling — uses $primary/$onPrimary from the active
  // Tamagui theme (e.g. terracotta for Eciperay Warm Harvest), not the raw
  // brand-neutral primary ramp.
  backgroundColor: "$primary",
  borderRadius: tokens.radii.md,
  borderWidth: 0,
  color: "$onPrimary",
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.semibold,
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[3],

  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        color: "$onPrimary",
      },
      secondary: {
        backgroundColor: tokens.colors.gray.gray3,
        color: tokens.colors.gray.gray10,
      },
      ghost: {
        // Visible affordance on any background: subtle primary fill plus a
        // primary border (a transparent fill left the button invisible on
        // white). The label color is set by the Button wrapper below — a
        // variant-level `color` does not reach Tamagui Button's internal
        // text element.
        backgroundColor: "$primarySubtle",
        borderWidth: 1,
        borderColor: "$primary",
      },
      danger: {
        // Danger ramp step 7 (not the $danger role at step 6) so white
        // label text keeps WCAG AA contrast on the filled background —
        // same value the apps' destructive buttons already render.
        backgroundColor: tokens.colors.danger.danger7,
        color: "#ffffff",
      },
    },
    size: {
      sm: {
        fontSize: tokens.typography.fontSize.sm,
        paddingHorizontal: tokens.spacing[3],
        paddingVertical: tokens.spacing[2],
      },
      md: {
        fontSize: tokens.typography.fontSize.md,
        paddingHorizontal: tokens.spacing[4],
        paddingVertical: tokens.spacing[3],
      },
      lg: {
        fontSize: tokens.typography.fontSize.lg,
        paddingHorizontal: tokens.spacing[6],
        paddingVertical: tokens.spacing[4],
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type StyledButtonProps = GetProps<typeof StyledButton>;

export interface ButtonProps extends Omit<StyledButtonProps, "disabled"> {
  disabled?: boolean;
}

/**
 * Label colors per variant. These must be passed as an instance `color`
 * prop: Tamagui Button forwards its base/instance `color` to the internal
 * text element, but a `styled()` variant's `color` only styles the frame —
 * so the ghost variant rendered its label in the base `$onPrimary` (white)
 * on a transparent background, and the secondary variant rendered white on
 * light gray. Both were effectively invisible.
 */
const variantLabelColors = {
  primary: "$onPrimary",
  secondary: tokens.colors.gray.gray10,
  ghost: "$primaryEmphasis",
  danger: "#ffffff",
} as const;

/**
 * Universal cross-platform button (web + React Native via Tamagui).
 *
 * Props: `variant` ("primary" | "secondary" | "ghost" | "danger"), `size`
 * ("sm" | "md" | "lg"), `disabled`. All styling is token-driven. Use
 * `danger` for destructive actions (delete, revoke, remove).
 * Accessibility: exposes `accessibilityRole="button"` and mirrors `disabled`
 * into `accessibilityState` (mapped to `aria-disabled` on web).
 */
export function Button({ disabled = false, variant = "primary", color, ...rest }: ButtonProps) {
  // `variant`'s prop type also admits Tamagui Button's built-in variant
  // names; only the four design-system variants have a mapped label color.
  const labelColor = color ?? variantLabelColors[variant as keyof typeof variantLabelColors];
  return (
    <StyledButton
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      variant={variant}
      color={labelColor}
      {...rest}
    />
  );
}
