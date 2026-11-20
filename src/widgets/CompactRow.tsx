import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCompactRow = styled(XStack, {
  name: "CompactRow",

  gap: tokens.spacing[2],
  flexWrap: "wrap",
  alignItems: "center",
});

type StyledCompactRowProps = GetProps<typeof StyledCompactRow>;

export type CompactRowProps = Omit<StyledCompactRowProps, "gap" | "alignItems" | "flexWrap">;

/**
 * A row of close actions (#698 tranche 3): the actions of a
 * block (a share-link row's generate / copy buttons, a
 * permalink row's URL and copy action) in order, separated
 * by the 8px compact rhythm, wrapping onto the next line at
 * narrow widths instead of overflowing. Sibling of
 * ButtonRow (12px): the compact rhythm is for actions that
 * sit inside a block, not under content. Call sites pass
 * only the actions: there are no spacing props, by design.
 */
export function CompactRow({ ...rest }: CompactRowProps) {
  return <StyledCompactRow {...rest} />;
}
