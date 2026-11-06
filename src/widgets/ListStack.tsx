import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";

const StyledListStack = styled(YStack, {
  name: "ListStack",
});

type StyledListStackProps = GetProps<typeof StyledListStack>;

export type ListStackProps = Omit<StyledListStackProps, "gap" | "alignItems">;

/**
 * A stack of list rows (#119): hairline rows (ListRow and its
 * kin) composed as one list. The stack adds no gap of its own —
 * the rows own their separation through their hairlines and
 * internal padding, so the list reads as one continuous ruled
 * surface — and it exists so a list composes as a single child
 * where a parent (a SectionCard, say) spaces its own children.
 * Call sites pass only the rows: there are no spacing props, by
 * design.
 */
export function ListStack({ ...rest }: ListStackProps) {
  return <StyledListStack {...rest} />;
}
