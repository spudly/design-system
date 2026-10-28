import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCard = styled(YStack, {
  name: "Card",

  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$borderColor",
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
export function Card({ variant, elevated = false, style, ...rest }: CardProps) {
  const resolvedVariant = variant ?? (elevated ? "elevated" : "default");
  // Android shadow for the elevated variant: `elevation` comes from the same
  // shadow token as the iOS shadow props above and is applied via `style`,
  // because Tamagui v3's styled() typing accepts it in neither the static
  // config nor this component's props. It is composed as a style array under
  // the caller's style (React Native flattens arrays left to right), so
  // unrelated caller styles — including caller style arrays — preserve the
  // shadow and an explicit caller elevation wins.
  const composedStyle = [
    resolvedVariant === "elevated" ? { elevation: tokens.shadows.md.elevation } : undefined,
    style,
  ];
  return <StyledCard variant={resolvedVariant} style={composedStyle} {...rest} />;
}
