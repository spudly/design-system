import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledTightStack = styled(YStack, {
  name: "TightStack",

  gap: tokens.spacing[1],
  alignItems: "stretch",
});

type StyledTightStackProps = GetProps<typeof StyledTightStack>;

export type TightStackProps = Omit<StyledTightStackProps, "gap" | "alignItems">;

/**
 * A stack of a view's tight blocks (#698 tranche 3): the
 * lines of a list or the rows of a loading mirror in order,
 * separated by the 4px tight rhythm, children stretched.
 * Sibling of CompactStack (8px) and ContentStack (12px):
 * each stack is named for its rhythm and owns it
 * completely, so views compose their blocks without
 * rendering a layout primitive. Call sites pass only the
 * blocks: there are no spacing props, by design.
 */
export function TightStack({ ...rest }: TightStackProps) {
  return <StyledTightStack {...rest} />;
}
