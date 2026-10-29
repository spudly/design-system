import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledChipRow = styled(XStack, {
  name: "ChipRow",

  flexWrap: "wrap",
  gap: tokens.spacing[2],
  alignItems: "flex-start",
});

type StyledChipRowProps = GetProps<typeof StyledChipRow>;

export type ChipRowProps = Omit<StyledChipRowProps, "flexWrap" | "gap" | "alignItems">;

/**
 * A wrapping row of chips and badges (#119): the small-item flow
 * a page renders for tag lists and chip action groups — 8px
 * between items, wrapping onto further lines as the row narrows,
 * items at their natural size (ButtonRow's flex-start alignment
 * at the chip scale). The row owns its gap and wrap outright;
 * separation from the content around it is the parent stack's.
 */
export function ChipRow({ ...rest }: ChipRowProps) {
  return <StyledChipRow {...rest} />;
}
