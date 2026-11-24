import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";

const StyledGrow = styled(YStack, {
  name: "Grow",

  flex: 1,
});

type StyledGrowProps = GetProps<typeof StyledGrow>;

export type GrowProps = Omit<StyledGrowProps, "flex">;

/**
 * A growing column (#698 tranche 3): a single child that
 * takes its flex row's remaining width — the field in a
 * field row that grows while its siblings keep their
 * natural widths. The dedicated growing component, so a
 * view never wraps a child in a raw layout primitive just
 * to size it. Call sites pass only the child.
 */
export function Grow({ ...rest }: GrowProps) {
  return <StyledGrow {...rest} />;
}
