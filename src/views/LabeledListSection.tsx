import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { LabeledGroup } from "../widgets/LabeledGroup.js";
import { Text } from "../widgets/Text.js";

export type LabeledListSectionProps = {
  /** The section's label. */
  label: string;
  /** The add action's label (the caller resolves its default).
   * Rendered only when `onAdd` is provided. */
  addLabel: string;
  /** Accessibility label for the add action. */
  addAccessibilityLabel: string;
  /** Add intent: the host appends its own row. When provided, the
   * add action renders in the label row. */
  onAdd?: () => void;
  /** Shown when the list is empty. */
  emptyMessage: string;
  /** Whether the list has no rows. */
  isEmpty: boolean;
  /** The rows, in display order (rendered only when not empty). */
  children?: ReactNode;
};

/**
 * The labeled-list chrome shared by the recipe form's sortable
 * list views (RecipeIngredientListView, RecipeInstructionListView):
 * the labeled section, the add action in its label row, the empty
 * state, and the vertical row stack. Extracted for #587 phase 2 —
 * both list views carried an identical copy of this rendering.
 * Internal helper: not exported from the views barrel and has no
 * story of its own; it is exercised through the list views' stories.
 */
export function LabeledListSection({
  label,
  addLabel,
  addAccessibilityLabel,
  onAdd,
  emptyMessage,
  isEmpty,
  children,
}: LabeledListSectionProps) {
  return (
    <LabeledGroup
      label={label}
      action={
        onAdd ? (
          <Button ghost size="sm" accessibilityLabel={addAccessibilityLabel} onPress={onAdd}>
            {addLabel}
          </Button>
        ) : null
      }
    >
      {isEmpty ? <Text variant="muted">{emptyMessage}</Text> : <YStack gap="$2">{children}</YStack>}
    </LabeledGroup>
  );
}
