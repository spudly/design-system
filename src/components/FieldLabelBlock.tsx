import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { FieldLabel } from "./FieldLabel.js";

export type FieldLabelBlockProps = {
  /** The label text. */
  label: string;
};

/**
 * A form block's standalone label (#119): the label text as
 * its own block in a form's stack, carrying the 8px bottom
 * padding the meal forms' list labels carry — the stack's own
 * gap then separates the block from the control that follows
 * it (a checkbox list, a chip group rendered as its own
 * block). Distinct from LabeledGroup, which wraps a label and
 * its control in one block: a form whose label and control
 * are separate stack blocks uses this instead, so the stack
 * rhythm between them is preserved.
 */
export function FieldLabelBlock({ label }: FieldLabelBlockProps) {
  return (
    <YStack paddingBlockEnd={tokens.spacing[2]}>
      <FieldLabel>{label}</FieldLabel>
    </YStack>
  );
}
