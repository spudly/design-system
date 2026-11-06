import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledFieldRow = styled(XStack, {
  name: "FieldRow",

  gap: tokens.spacing[2],
  alignItems: "center",
});

type StyledFieldRowProps = GetProps<typeof StyledFieldRow>;

export type FieldRowProps = Omit<StyledFieldRowProps, "gap" | "alignItems">;

/**
 * A row of form fields and their action (#119): a field (given
 * SearchField's `grow`, or a text field's own flex) takes the
 * row's remaining width, the action button keeps its natural
 * width, and the two are vertically centered on each other with
 * an 8px gap — the shape of a search row, a filter row, an
 * invite-by-email row on any site. Call sites pass only the
 * fields and the action: there are no spacing props, by
 * design.
 */
export function FieldRow({ ...rest }: FieldRowProps) {
  return <StyledFieldRow {...rest} />;
}
