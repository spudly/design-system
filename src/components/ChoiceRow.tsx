import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledChoiceRow = styled(XStack, {
  name: "ChoiceRow",

  gap: tokens.spacing[2],
  flexWrap: "wrap",
  alignItems: "flex-start",
});

type StyledChoiceRowProps = GetProps<typeof StyledChoiceRow>;

export type ChoiceRowProps = Omit<StyledChoiceRowProps, "gap" | "flexWrap" | "alignItems">;

/**
 * A row of choices (#119): the buttons a user picks one from —
 * an add-filter chooser's not-yet-added filters, a picker's
 * options — at an 8px gap, wrapping onto the next line at
 * narrow widths instead of overflowing. Call sites pass only
 * the choices: there are no spacing props, by design. For a
 * bar of actions that follow content (a card's footer
 * buttons), use ButtonRow instead.
 */
export function ChoiceRow({ ...rest }: ChoiceRowProps) {
  return <StyledChoiceRow {...rest} />;
}
