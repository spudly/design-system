import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCompactStack = styled(YStack, {
  name: "CompactStack",

  gap: tokens.spacing[2],
  alignItems: "stretch",
});

type StyledCompactStackProps = GetProps<typeof StyledCompactStack>;

export type CompactStackProps = Omit<StyledCompactStackProps, "gap" | "alignItems">;

/**
 * A stack of a view's close blocks (#698 tranche 3): the
 * blocks of a composed view in order, separated by the 8px
 * compact rhythm, children stretched. Sibling of
 * ContentStack (12px) and TightStack (4px): each stack is
 * named for its rhythm and owns it completely, so views
 * compose their blocks without rendering a layout
 * primitive. Call sites pass only the blocks: there are no
 * spacing props, by design.
 */
export function CompactStack({ ...rest }: CompactStackProps) {
  return <StyledCompactStack {...rest} />;
}
