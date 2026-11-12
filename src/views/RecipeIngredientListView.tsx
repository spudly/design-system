import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { LabeledGroup } from "../widgets/LabeledGroup.js";
import { Text } from "../widgets/Text.js";
import {
  RecipeIngredientRowView,
  type RecipeIngredientField,
  type RecipeIngredientRow,
} from "./RecipeIngredientRowView.js";

export type { RecipeIngredientField, RecipeIngredientRow };

export type RecipeIngredientListViewProps = {
  /** Section label ("Ingredients"). */
  label?: string;
  /** The rows, in display order (the #124 view-models). */
  rows: RecipeIngredientRow[];
  /** Shown when the list is empty ("No ingredients yet"). */
  emptyMessage?: string;
  /** The add action's label ("+ Add"). */
  addLabel?: string;
  /** Add intent: the host appends its own empty row (it owns
   * row keys and shape defaults). Renders the add action —
   * in the label row, where the hosts put it — only when
   * provided. */
  onAdd?: () => void;
  /** Field-change intent from a row: its key, the field, and
   * the new text. */
  onFieldChange?: (rowKey: string, field: RecipeIngredientField, value: string) => void;
  /** Remove intent from a row: its key. */
  onRemove?: (rowKey: string) => void;
  /**
   * Binds the host's drag handle for a row (Stephen's
   * 2026-11-09 boundary on #130): the host's drag container
   * renders its handle through this — for web, a component
   * holding its sortable activator; the design system itself
   * renders no handle and takes no drag dependency. A native
   * host whose container IS the list (DraggableFlatList)
   * renders RecipeIngredientRowView from its own renderItem
   * instead and passes the handle to the row directly.
   */
  renderDragHandle?: (row: RecipeIngredientRow, index: number) => ReactNode;
};

/**
 * RecipeIngredientListView (#130, tranche T4): the recipe
 * form's ingredient list chrome as a view — the labeled
 * section, the add action in its label row, the empty state,
 * and the rows (RecipeIngredientRowView) in order — landing
 * the sortable-list build under Stephen's 2026-11-09 drag
 * boundary: the DS owns the row views and the list chrome,
 * emitting field-change / add / remove intents; hosts keep
 * their drag containers and bind the handle.
 *
 * The list is controlled and owns no state: rows cross as
 * view-models, edits and removals report the row's key, an
 * add is a bare intent (the host mints the new row's key),
 * and a reorder performed in the host's drag container
 * crosses back as a new `rows` array — no drag library, and
 * no reorder callback, enters the design system.
 */
export function RecipeIngredientListView({
  label = "Ingredients",
  rows,
  emptyMessage = "No ingredients yet",
  addLabel = "+ Add",
  onAdd,
  onFieldChange,
  onRemove,
  renderDragHandle,
}: RecipeIngredientListViewProps) {
  return (
    <LabeledGroup
      label={label}
      action={
        onAdd ? (
          <Button ghost size="sm" accessibilityLabel="Add ingredient" onPress={onAdd}>
            {addLabel}
          </Button>
        ) : null
      }
    >
      {rows.length === 0 ? (
        <Text variant="muted">{emptyMessage}</Text>
      ) : (
        <YStack gap="$2">
          {rows.map((row, index) => (
            <RecipeIngredientRowView
              key={row.key}
              row={row}
              index={index}
              {...(renderDragHandle ? { dragHandle: renderDragHandle(row, index) } : {})}
              {...(onFieldChange ? { onFieldChange } : {})}
              {...(onRemove ? { onRemove } : {})}
            />
          ))}
        </YStack>
      )}
    </LabeledGroup>
  );
}
