import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledFieldRow = styled(XStack, {
  name: "FieldRow",

  gap: tokens.spacing[2],
  alignItems: "stretch",
});

type StyledFieldRowProps = GetProps<typeof StyledFieldRow>;

export type FieldRowProps = Omit<StyledFieldRowProps, "gap" | "alignItems">;

/**
 * A row of form fields and their action (#119): a field (given
 * SearchField's `grow`, or a text field's own flex) takes the
 * row's remaining width, the action button keeps its natural
 * width, and the action stretches to the field's height so the
 * two line up as one bar with an 8px gap — the shape of a
 * search row, a filter row, an invite-by-email row on any
 * site. The stretch is structural, not cosmetic (eciperay
 * #188): an action's natural height can be shorter than the
 * field's (the catalog bar's small Filters button is), and a
 * row that does not stretch it leaves the bar's controls at
 * two heights. Call sites pass only the fields and the
 * action: there are no spacing props, by design. (SearchRow,
 * which carried only this stretch difference, was
 * consolidated into this component — #481.)
 */
export function FieldRow({ ...rest }: FieldRowProps) {
  return <StyledFieldRow {...rest} />;
}
