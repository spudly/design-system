import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledProseStack = styled(YStack, {
  name: "ProseStack",

  gap: tokens.spacing[3],
});

type StyledProseStackProps = GetProps<typeof StyledProseStack>;

export type ProseStackProps = Omit<StyledProseStackProps, "gap">;

/**
 * A prose block's stack (#119): a document's title block (a
 * heading over its meta line) or one section (a subheading
 * over its blocks), separated by the 12px prose rhythm. Call
 * sites pass only the block's contents: there are no spacing
 * props, by design — the stack owns the rhythm so every prose
 * block in the system is spaced identically.
 */
export function ProseStack({ ...rest }: ProseStackProps) {
  return <StyledProseStack {...rest} />;
}
