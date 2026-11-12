import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { FieldRow } from "../widgets/FieldRow.js";
import { Text } from "../widgets/Text.js";
import { TextAreaField } from "./TextAreaField.js";

/**
 * One instruction row's view-model: the settled #124 row
 * contract. `key` is the host's stable row identity (its drag
 * containers key on it); the step's number is its position in
 * the list, never data — it renders from the row's index.
 */
export type RecipeInstructionRow = {
  key: string;
  body: string;
};

export type RecipeInstructionRowViewProps = {
  /** The row's view-model (the #124 contract above). */
  row: RecipeInstructionRow;
  /** The row's position in its list: renders as the step
   * number and names the row's field and actions for
   * assistive tech ("Step 2"). */
  index: number;
  /**
   * The host's drag handle for this row, bound by the host's
   * drag container (Stephen's 2026-11-09 boundary on #130:
   * hosts keep their drag containers — dnd-kit on web,
   * DraggableFlatList on native — and bind the handle into
   * the DS row). The design system renders no handle of its
   * own and takes no drag dependency; omitted, the row
   * renders without a handle (a read-only-order context).
   */
  dragHandle?: ReactNode;
  /** Body-change intent: the row's key and the new text. The
   * host folds it into its form state. */
  onBodyChange?: (rowKey: string, value: string) => void;
  /** Remove intent: the row's key. Renders the remove action
   * only when provided. */
  onRemove?: (rowKey: string) => void;
};

/**
 * RecipeInstructionRowView (#130, tranche T4): one editable
 * instruction step as a view — the step number, the body
 * field, the host-bound drag handle, and the remove action,
 * composed from the DS fields so hosts no longer build the
 * row from raw inputs beside their drag containers.
 *
 * The row is controlled and owns no state: the body crosses
 * as the #124 view-model, every edit reports the row's key,
 * and reordering never enters the row — the host's drag
 * container owns the gesture and feeds the new order back in
 * as a new rows array on the list view (the step numbers
 * re-derive from position on the next render).
 */
export function RecipeInstructionRowView({
  row,
  index,
  dragHandle,
  onBodyChange,
  onRemove,
}: RecipeInstructionRowViewProps) {
  const position = index + 1;
  return (
    <FieldRow>
      {dragHandle ?? null}
      <YStack justifyContent="center">
        <Text variant="muted">{`${position}.`}</Text>
      </YStack>
      <YStack flex={1}>
        <TextAreaField
          accessibilityLabel={`Step ${position}`}
          numberOfLines={2}
          value={row.body}
          onChangeText={(value) => {
            onBodyChange?.(row.key, value);
          }}
        />
      </YStack>
      {onRemove ? (
        <Button
          variant="danger"
          size="sm"
          accessibilityLabel={`Remove step ${position}`}
          onPress={() => {
            onRemove(row.key);
          }}
        >
          Remove
        </Button>
      ) : null}
    </FieldRow>
  );
}
