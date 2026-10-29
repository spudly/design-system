import type { ReactNode } from "react";
import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { FieldLabel } from "./FieldLabel.js";

/**
 * The one label row the labeled form compositions share
 * (#119 dedupe): the FieldLabel on the left, the optional
 * action cluster right-aligned beside it at its own 8px
 * rhythm, and the caller's separation below the row (a single
 * field's 4px, a control group's 8px — the wrappers' only
 * difference). Internal: LabeledField and LabeledGroup are
 * the shipped compositions; this module is not exported.
 */
export function LabelRow({
  label,
  action,
  separation,
}: {
  label: string;
  action?: ReactNode;
  /** The space below the row, as a spacing-scale step. */
  separation: 1 | 2;
}) {
  return (
    <XStack
      paddingBlockEnd={tokens.spacing[separation]}
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
  );
}
