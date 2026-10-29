import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { FieldLabel } from "./FieldLabel.js";

export type LabeledGroupProps = {
  /** The group's label, rendered in the FieldLabel treatment. */
  label: string;
  /** Optional trailing action for the label row (e.g. a revert
   * affordance): the row right-aligns it beside the label. */
  action?: ReactNode;
  /** The control group itself (a chip group, a select list, a
   * loading spinner standing in for one, …). */
  children: ReactNode;
};

/**
 * A labeled control group (#119): the FieldLabel on the left,
 * the optional action right-aligned beside it, and the group
 * itself 8px below the row — the wider label-to-group
 * separation the form pages give chip groups and select lists,
 * owned here so no page sets it. LabeledField is the sibling
 * for a single field, whose label sits 4px above the field.
 */
export function LabeledGroup({ label, action, children }: LabeledGroupProps) {
  return (
    <YStack>
      <XStack
        paddingBlockEnd={tokens.spacing[2]}
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
    </YStack>
  );
}
