import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledListHeaderStack = styled(YStack, {
  name: "ListHeaderStack",

  paddingBlockStart: tokens.spacing[4],
  paddingBlockEnd: tokens.spacing[2],
  gap: tokens.spacing[4],
});

type StyledListHeaderStackProps = GetProps<typeof StyledListHeaderStack>;

export type ListHeaderStackProps = Omit<
  StyledListHeaderStackProps,
  "paddingBlockStart" | "paddingBlockEnd" | "gap"
>;

/**
 * A list header's stack (#698 tranche 4): a catalog list's
 * title over its controls, with the header's own vertical
 * rhythm — the 16px top inset, the 8px bottom inset, and
 * the 16px title-to-controls separation — owned outright,
 * so the header scrolls with its list as one block. Call
 * sites pass only the title and the controls: there are
 * no spacing props, by design.
 */
export function ListHeaderStack({ ...rest }: ListHeaderStackProps) {
  return <StyledListHeaderStack {...rest} />;
}
