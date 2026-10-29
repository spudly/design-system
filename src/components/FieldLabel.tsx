import { Label, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type FieldLabelProps = {
  /** The label text. */
  children: string;
  /**
   * The id of the field control this label names. On web the
   * label renders as a real HTML label element whose `for`
   * carries this id, so the control is programmatically named
   * by the visible label. The compositions that place a label
   * (LabeledField, LabeledGroup) take the same id as their
   * `fieldId` and forward it here; the caller passes that id
   * to the control itself (the field components take an `id`
   * prop). Native has no label element, so the association is
   * web-only — there the control's own accessible name (its
   * `accessibilityLabel`) carries the naming, as before.
   */
  htmlFor?: string | undefined;
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
 *
 * Platform split (Stephen's ruling on PR #320): on web this is
 * a real `<label>` element with a proper `for` attribute when
 * the label names a control; on native it keeps the plain text
 * treatment, where no label element exists.
 */
export function FieldLabel({ children, htmlFor }: FieldLabelProps) {
  if (isWeb) {
    return (
      <Label
        {...(htmlFor ? { htmlFor } : {})}
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.medium}
        color={tokens.colors.gray.gray8}
      >
        {children}
      </Label>
    );
  }
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
