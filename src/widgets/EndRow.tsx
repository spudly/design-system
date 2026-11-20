import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";

const StyledEndRow = styled(XStack, {
  name: "EndRow",

  justifyContent: "flex-end",
});

type StyledEndRowProps = GetProps<typeof StyledEndRow>;

export type EndRowProps = Omit<StyledEndRowProps, "justifyContent">;

/**
 * A row whose children sit at its end (#698 tranche 3): a
 * single trailing action (a composer's post button) pushed
 * to the row's end. Call sites pass only the action: there
 * are no alignment props, by design — a row that starts
 * its children is a ButtonRow, a row that centers them is
 * a StackedButtonRow.
 */
export function EndRow({ ...rest }: EndRowProps) {
  return <StyledEndRow {...rest} />;
}
