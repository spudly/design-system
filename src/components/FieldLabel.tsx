import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type FieldLabelProps = {
  /** The label text. */
  children: string;
};

/**
 * The label of a form field or a labeled control group (#119):
 * small, medium-weight, muted gray text that names the control
 * below it. This is the one label treatment across the form
 * pages — RecipeFormPage's field labels and the meal forms'
 * section labels were the same hand-rolled Text props in every
 * page before the extraction — so the treatment lives here once
 * and the compositions that place a label (LabeledField,
 * LabeledGroup) render it instead of restyling text themselves.
 */
export function FieldLabel({ children }: FieldLabelProps) {
  return (
    <Text
      fontSize={tokens.typography.fontSize.sm}
      fontWeight={tokens.typography.fontWeight.medium}
      color={tokens.colors.gray.gray8}
    >
      {children}
    </Text>
  );
}
