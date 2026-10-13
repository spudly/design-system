import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCard = styled(YStack, {
  name: "SpudlyCard",

  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: tokens.colors.gray.gray3,
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing[4],

  variants: {
    elevated: {
      true: {
        borderWidth: 0,
        shadowColor: tokens.shadows.md.shadowColor,
        shadowOffset: tokens.shadows.md.shadowOffset,
        shadowOpacity: tokens.shadows.md.shadowOpacity,
        shadowRadius: tokens.shadows.md.shadowRadius,
      },
    },
  } as const,
});

type StyledCardProps = GetProps<typeof StyledCard>;

export interface CardProps extends StyledCardProps {
  elevated?: boolean;
}

/**
 * Surface container: bordered card by default, `elevated` for a soft shadow
 * instead of a border. Padding and radius come from tokens.
 */
export function Card({ elevated = false, ...rest }: CardProps) {
  return <StyledCard elevated={elevated} {...rest} />;
}
