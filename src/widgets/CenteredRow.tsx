import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCenteredRow = styled(XStack, {
  name: "CenteredRow",

  gap: tokens.spacing[3],
  alignItems: "center",
});

type StyledCenteredRowProps = GetProps<typeof StyledCenteredRow>;

export type CenteredRowProps = Omit<StyledCenteredRowProps, "gap" | "alignItems">;

/**
 * A centered row (#698 tranche 4): a row whose items are
 * vertically centered on each other at the 12px rhythm —
 * the row a loading mirror's slots sit in (a touch-target
 * slot beside its label column). Call sites pass only the
 * items (and a minimum height where a mirrored row owns
 * one): there are no spacing props, by design.
 */
export function CenteredRow({ ...rest }: CenteredRowProps) {
  return <StyledCenteredRow {...rest} />;
}
