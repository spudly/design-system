import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledLinkStack = styled(YStack, {
  name: "LinkStack",

  gap: tokens.spacing[2],
});

type StyledLinkStackProps = GetProps<typeof StyledLinkStack>;

export type LinkStackProps = Omit<StyledLinkStackProps, "gap">;

/**
 * A stack of links (#119): text links listed one per line (a
 * legal-links block, a footer link list), separated by the 8px
 * list rhythm. Call sites pass only the links: there are no
 * spacing props, by design — the stack owns the rhythm so every
 * link list in the system is spaced identically.
 */
export function LinkStack({ ...rest }: LinkStackProps) {
  return <StyledLinkStack {...rest} />;
}
