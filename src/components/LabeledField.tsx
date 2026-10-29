import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { FieldLabel } from "./FieldLabel.js";
import { Text } from "./Text.js";

export type LabeledFieldProps = {
  /** The field's label, rendered in the FieldLabel treatment. */
  label: string;
  /** Optional trailing action for the label row (a revert
   * affordance, a generate button, or several composed in a
   * fragment): the row right-aligns it beside the label, with
   * the actions cluster's own 8px rhythm between items. */
  action?: ReactNode;
  /** Field error, rendered below the field at the form's 8px
   * error separation (the TextField `error` idiom, for fields
   * whose error the host places itself). */
  error?: string | null | undefined;
  /** The field itself (a TextField, a chip group, …). */
  children: ReactNode;
};

/**
 * A form field with its label row (#119): the FieldLabel on the
 * left, the optional action cluster right-aligned beside it,
 * and the field itself 4px below the row — the label-to-field
 * separation every field section of the form pages used, owned
 * here so no page sets it. LabeledGroup is the sibling for a
 * labeled control GROUP (a chip group, a select list), whose
 * label sits 8px above the group instead.
 */
export function LabeledField({ label, action, error, children }: LabeledFieldProps) {
  return (
    <YStack>
      <XStack
        paddingBlockEnd={tokens.spacing[1]}
        alignItems="center"
        justifyContent="space-between"
        gap={tokens.spacing[3]}
      >
        <FieldLabel>{label}</FieldLabel>
        {action ? (
          <XStack alignItems="center" gap={tokens.spacing[2]}>
            {action}
          </XStack>
        ) : null}
      </XStack>
      {children}
      {error ? (
        <YStack paddingBlockStart={tokens.spacing[2]}>
          <Text variant="error">{error}</Text>
        </YStack>
      ) : null}
    </YStack>
  );
}
