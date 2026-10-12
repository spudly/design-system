import { Button as TamaguiButton, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledButton = styled(TamaguiButton, {
  name: "SpudlyButton",

  // Base: token-driven styling only — no hardcoded colors, spacing, or radii.
  backgroundColor: tokens.colors.primary.primary6,
  borderRadius: tokens.radii.md,
  borderWidth: 0,
  color: tokens.colors.gray.gray1,
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.semibold,
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[3],

  variants: {
    variant: {
      primary: {
        backgroundColor: tokens.colors.primary.primary6,
        color: tokens.colors.gray.gray1,
      },
      secondary: {
        backgroundColor: tokens.colors.gray.gray3,
        color: tokens.colors.gray.gray10,
      },
      ghost: {
        backgroundColor: "transparent",
        color: tokens.colors.primary.primary7,
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
