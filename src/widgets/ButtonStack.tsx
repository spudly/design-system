import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledButtonStack = styled(YStack, {
  name: "ButtonStack",

  gap: tokens.spacing[3],
  alignItems: "stretch",
});

type StyledButtonStackProps = GetProps<typeof StyledButtonStack>;

export type ButtonStackProps = Omit<StyledButtonStackProps, "gap" | "alignItems">;

/**
 * A stack of full-width buttons (#119): the vertical form of
 * ButtonRow — a page's main actions listed one per line, each
 * stretched to the stack's width (a home screen's Browse / Add /
 * Shared actions; an auth screen's sign-in stack). The stack
 * owns the 12px gap between buttons; separation from the
 * content around the stack is the parent's, never the stack's
 * own. Call sites pass only the buttons: there are no spacing
 * props, by design.
 */
export function ButtonStack({ ...rest }: ButtonStackProps) {
  return <StyledButtonStack {...rest} />;
}
