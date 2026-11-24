import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledStartStack = styled(YStack, {
  name: "StartStack",

  gap: tokens.spacing[2],
  alignItems: "flex-start",
});

type StyledStartStackProps = GetProps<typeof StyledStartStack>;

export type StartStackProps = Omit<StyledStartStackProps, "gap" | "alignItems">;

/**
 * A stack of start-aligned actions (#698 tranche 4): the
 * actions of a section (a primary action over its ghost
 * action over its portal link) listed at the 8px compact
 * rhythm, each keeping its natural width at the stack's
 * start instead of stretching. Call sites pass only the
 * actions: there are no spacing props, by design.
 */
export function StartStack({ ...rest }: StartStackProps) {
  return <StyledStartStack {...rest} />;
}
