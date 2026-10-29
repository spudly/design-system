import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { LabelRow } from "./labelRow.js";

export type LabeledGroupProps = {
  /** The group's label, rendered in the FieldLabel treatment. */
  label: string;
  /** Optional trailing action for the label row (e.g. a revert
   * affordance): the row right-aligns it beside the label. */
  action?: ReactNode;
  /** The control group itself (an option group, a select
   * list, a loading spinner standing in for one, …). */
  children: ReactNode;
};

/**
 * A labeled control group (#119): the FieldLabel on the left,
 * the optional action right-aligned beside it, and the group
 * itself 8px below the row — the wider label-to-group
 * separation the form pages give option groups and select
 * lists, owned here so no page sets it. LabeledField is the
 * sibling for a single field, whose label sits 4px above the
 * field. The label row itself is the one implementation both
 * wrappers share (labelRow).
 */
export function LabeledGroup({ label, action, children }: LabeledGroupProps) {
  return (
    <YStack>
      <LabelRow label={label} action={action} separation={2} />
      {children}
    </YStack>
  );
}
