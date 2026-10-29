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
 * A stack of form fields (#119): fields and field groups in
 * order — a filter's paired selects, a form's field rows —
 * separated by the 12px field rhythm (the same rhythm a
 * SectionCard keeps between its own children). Call sites pass
 * only the fields: there are no spacing props, by design — the
 * stack owns the rhythm so every field group in the system is
 * spaced identically.
 */
export function FieldStack({ ...rest }: FieldStackProps) {
  return <StyledFieldStack {...rest} />;
}
