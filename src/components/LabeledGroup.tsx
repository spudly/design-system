import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { groupRoleProps, platformAccessibilityProps } from "./accessibility.js";
import { LabelRow } from "./labelRow.js";

export type LabeledGroupProps = {
  /** The group's label, rendered in the FieldLabel treatment. */
  label: string;
  /** The id of the single control the label names, when the
   * group is one field-like control (a select list, a spinner
   * standing in for one): pass the same id to that control and
   * on web the label renders as a real label element whose
   * `for` names it. Multi-control groups omit it — their
   * naming is the group role below, not a `for`. */
  fieldId?: string | undefined;
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
 *
 * The group carries its label as its programmatic name (the
 * NumberStepper pattern): a group role on web, the accessible
 * name carrying the grouping on native, where no group role
 * exists — so a screen-reader user entering the controls hears
 * what the set controls.
 */
export function LabeledGroup({ label, fieldId, action, children }: LabeledGroupProps) {
  return (
    <YStack>
      <LabelRow label={label} action={action} separation={2} htmlFor={fieldId} />
      <YStack {...groupRoleProps} {...platformAccessibilityProps({ accessibilityLabel: label })}>
        {children}
      </YStack>
    </YStack>
  );
}
