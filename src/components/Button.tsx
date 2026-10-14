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
        backgroundColor: "transparent",
        color: "$primary",
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
 * Universal cross-platform button (web + React Native via Tamagui).
 *
 * Props: `variant` ("primary" | "secondary" | "ghost"), `size`
 * ("sm" | "md" | "lg"), `disabled`. All styling is token-driven.
 * Accessibility: exposes `accessibilityRole="button"` and mirrors `disabled`
 * into `accessibilityState` (mapped to `aria-disabled` on web).
 */
export function Button({ disabled = false, ...rest }: ButtonProps) {
  return (
    <StyledButton
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      {...rest}
    />
  );
}
