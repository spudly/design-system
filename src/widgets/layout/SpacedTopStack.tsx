import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledSpacedTopStack = styled(YStack, {
  name: "SpacedTopStack",

  paddingTop: tokens.spacing[3],
});

type StyledSpacedTopStackProps = GetProps<typeof StyledSpacedTopStack>;

export type SpacedTopStackProps = Omit<StyledSpacedTopStackProps, "paddingTop">;

/**
 * A stack set off from what precedes it (#698 tranche 4):
 * a single block (a form's save action) carrying the 12px
 * top inset that separates it from the fields above it,
 * on top of the parent stack's own gap. Call sites pass
 * only the block: there are no spacing props, by design.
 */
export function SpacedTopStack({ ...rest }: SpacedTopStackProps) {
  return <StyledSpacedTopStack {...rest} />;
}
