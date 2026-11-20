import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCenteredRow = styled(XStack, {
  name: "CenteredRow",

  gap: tokens.spacing[3],
  alignItems: "center",
  minHeight: 44,
});

type StyledCenteredRowProps = GetProps<typeof StyledCenteredRow>;

export type CenteredRowProps = Omit<StyledCenteredRowProps, "gap" | "alignItems" | "minHeight">;

/**
 * A centered row (#698 tranche 4): a row whose items are
 * vertically centered on each other at the 12px rhythm —
 * the row a loading mirror's slots sit in (a touch-target
 * slot beside its label column), at the 44px touch-target
 * minimum height the mirrored field row owns. Call sites
 * pass only the items: there are no spacing props, by
 * design.
 */
export function CenteredRow({ ...rest }: CenteredRowProps) {
  return <StyledCenteredRow {...rest} />;
}
