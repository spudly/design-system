import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledStatRow = styled(XStack, {
  name: "SpudlyStatRow",

  justifyContent: "space-around",
  backgroundColor: tokens.colors.gray.gray1,
  borderRadius: tokens.radii.lg,
  paddingVertical: tokens.spacing[4],
});

type StyledStatRowProps = GetProps<typeof StyledStatRow>;

export interface StatRowProps extends StyledStatRowProps {}

/**
 * Recessed band that spreads a row of StatCards across the width of a
 * screen section (a recipe's servings / prep / cook stats, a plan's
 * totals): gray step-1 fill, large radius, and space-around distribution
 * so each stat centers in its share of the band. Children are typically
 * StatCards; layout props (margins, gap) pass through to the band.
 */
export function StatRow({ children, ...rest }: StatRowProps) {
  return <StyledStatRow {...rest}>{children}</StyledStatRow>;
}
