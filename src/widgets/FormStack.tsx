import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledFormStack = styled(YStack, {
  name: "FormStack",

  gap: tokens.spacing[3],
  alignItems: "stretch",
});

type StyledFormStackProps = GetProps<typeof StyledFormStack>;

export type FormStackProps = Omit<StyledFormStackProps, "gap" | "alignItems">;

/**
 * The one form stack (#119, #477): a form's fields and sections
 * (labeled fields, banners, slots, the submit row) in order,
 * separated by the 12px field rhythm, children stretched. It
 * combines the former FormStack and FieldStack into a single
 * component (Stephen's #477 ruling: no level variant — the
 * field-level styling survives, so there is no extra bottom
 * padding; former section-level usages take the tighter rhythm).
 * Separation is the stack's gap by construction — a child never
 * wraps itself to set its own separation. Call sites pass only
 * the children: there are no spacing props, by design.
 */
export function FormStack({ ...rest }: FormStackProps) {
  return <StyledFormStack {...rest} />;
}
