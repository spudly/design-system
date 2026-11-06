import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledFormStack = styled(YStack, {
  name: "FormStack",

  gap: tokens.spacing[4],
  alignItems: "stretch",
  paddingBlockEnd: tokens.spacing[8],
});

type StyledFormStackProps = GetProps<typeof StyledFormStack>;

export type FormStackProps = Omit<StyledFormStackProps, "gap" | "alignItems" | "paddingBlockEnd">;

/**
 * A form's body stack (#119): the form's sections (labeled
 * fields, banners, slots, the submit row) in order, separated
 * by the forms' 16px section rhythm, with the 32px bottom
 * padding a scrollable form body ends with. Section separation
 * is the stack's gap by construction — a section never wraps
 * itself to set its own separation. Call sites pass only the
 * sections: there are no spacing props, by design.
 */
export function FormStack({ ...rest }: FormStackProps) {
  return <StyledFormStack {...rest} />;
}
