import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledFieldStack = styled(YStack, {
  name: "FieldStack",

  gap: tokens.spacing[3],
  alignItems: "stretch",
});

type StyledFieldStackProps = GetProps<typeof StyledFieldStack>;

export type FieldStackProps = Omit<StyledFieldStackProps, "gap" | "alignItems">;

/**
 * A stack of form fields (#119): one form's fields in order — a
 * text field over the row that serves it, a group of fields over
 * their submit row — separated by the 12px field rhythm. The
 * stack owns the gap so the fields of a form never set their own
 * separation; call sites pass only the fields. It is the form
 * counterpart of the page stacks (SectionStack for a page's
 * sections, CardStack for a list of cards): each stack is named
 * for what it contains and owns that content's rhythm.
 */
export function FieldStack({ ...rest }: FieldStackProps) {
  return <StyledFieldStack {...rest} />;
}
