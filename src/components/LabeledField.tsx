import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LabelRow } from "./labelRow.js";
import { Text } from "./Text.js";

export type LabeledFieldProps = {
  /** The field's label, rendered in the FieldLabel treatment. */
  label: string;
  /** The field control's id. Pass the same id to the control
   * itself (the field components take an `id` prop): on web the
   * label then renders as a real label element whose `for`
   * names the control, and the error below the field carries
   * the deterministic id `${fieldId}-error` — the same error-id
   * shape the field components use for their own `error` prop —
   * so a host wiring a raw control can point its
   * `aria-describedby` at it. */
  fieldId?: string | undefined;
  /** Optional trailing action for the label row (a revert
   * affordance, a generate button, or several composed in a
   * fragment): the row right-aligns it beside the label, with
   * the actions cluster's own 8px rhythm between items. */
  action?: ReactNode;
  /** Field error, rendered below the field at the form's 8px
   * error separation (the TextField `error` idiom, for fields
   * whose error the host places itself). */
  error?: string | null | undefined;
  /** The field itself (a TextField, an option group, …). */
  children: ReactNode;
};

/**
 * A form field with its label row (#119): the FieldLabel on the
 * left, the optional action cluster right-aligned beside it,
 * and the field itself 4px below the row — the label-to-field
 * separation every field section of the form pages used, owned
 * here so no page sets it. LabeledGroup is the sibling for a
 * labeled control GROUP (an option group, a select list), whose
 * label sits 8px above the group instead. The label row itself
 * is the one implementation both wrappers share (labelRow).
 */
export function LabeledField({ label, fieldId, action, error, children }: LabeledFieldProps) {
  return (
    <YStack>
      <LabelRow label={label} action={action} separation={1} htmlFor={fieldId} />
      {children}
      {error ? (
        <YStack paddingBlockStart={tokens.spacing[2]}>
          <Text variant="error" {...(fieldId ? { id: `${fieldId}-error` } : {})}>
            {error}
          </Text>
        </YStack>
      ) : null}
    </YStack>
  );
}
