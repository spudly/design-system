import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCard = styled(YStack, {
  name: "SpudlyCard",

  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$border",
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing[4],

  variants: {
    variant: {
      // Standard section surface: filled and bordered.
      default: {},
      // Outline only — no surface fill; content sits on the page background.
      bordered: {
        backgroundColor: "transparent",
      },
      // Recessed section: page-background fill, no border.
      muted: {
        backgroundColor: "$background",
        borderWidth: 0,
      },
      // Raised section: filled, soft shadow instead of a border.
      elevated: {
        borderWidth: 0,
        shadowColor: tokens.shadows.md.shadowColor,
        shadowOffset: tokens.shadows.md.shadowOffset,
        shadowOpacity: tokens.shadows.md.shadowOpacity,
        shadowRadius: tokens.shadows.md.shadowRadius,
      },
    },
  } as const,

  defaultVariants: {
    variant: "default",
  },
});

type StyledCardProps = GetProps<typeof StyledCard>;

export interface CardProps extends StyledCardProps {
  /**
   * Appearance: `default` (filled, bordered), `bordered` (outline only),
   * `muted` (page-background fill, no border), `elevated` (filled, soft
   * shadow, no border).
   */
  variant?: "default" | "bordered" | "muted" | "elevated";
  /** @deprecated Use `variant="elevated"` instead. Kept for existing consumers. */
  elevated?: boolean;
}

/**
 * Surface container with token-driven padding and radius. Appearance comes
 * from `variant` (see {@link CardProps}); the legacy `elevated` boolean maps
 * to `variant="elevated"` when no variant is given.
 */
export function Card({ variant, elevated = false, ...rest }: CardProps) {
  const resolvedVariant = variant ?? (elevated ? "elevated" : "default");
  return <StyledCard variant={resolvedVariant} {...rest} />;
}
