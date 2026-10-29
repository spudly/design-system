import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCompactCard = styled(YStack, {
  name: "CompactCard",

  backgroundColor: "$surface",
  borderRadius: tokens.radii.md,
  padding: tokens.spacing[3],
  shadowColor: tokens.shadows.sm.shadowColor,
  shadowOffset: tokens.shadows.sm.shadowOffset,
  shadowOpacity: tokens.shadows.sm.shadowOpacity,
  shadowRadius: tokens.shadows.sm.shadowRadius,
});

type StyledCompactCardProps = GetProps<typeof StyledCompactCard>;

export type CompactCardProps = StyledCompactCardProps;

/**
 * The compact card (#119): a small surface card — 12px padding,
 * the medium radius, the small shadow — for dense list rows and
 * inline editors, where Card's section treatment (16px padding,
 * the large radius) is too grand for the content. The card owns
 * its surface only; what goes inside (a row, a small form) is
 * the caller's composition, and separation between cards is the
 * composing stack's, never the card's own.
 */
export function CompactCard({ ...rest }: CompactCardProps) {
  return <StyledCompactCard {...rest} />;
}
