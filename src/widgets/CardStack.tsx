import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledCardStack = styled(YStack, {
  name: "CardStack",

  gap: tokens.spacing[2],
  alignItems: "stretch",
});

type StyledCardStackProps = GetProps<typeof StyledCardStack>;

export type CardStackProps = Omit<StyledCardStackProps, "gap" | "alignItems">;

/**
 * A stack of cards (#119): a list whose rows are cards (a plan
 * list, a result list), separated by the 8px list rhythm while
 * each card keeps its own internal padding. Call sites pass
 * only the cards: there are no spacing props, by design — the
 * stack owns the rhythm so every card list in the system is
 * spaced identically.
 */
export function CardStack({ ...rest }: CardStackProps) {
  return <StyledCardStack {...rest} />;
}
