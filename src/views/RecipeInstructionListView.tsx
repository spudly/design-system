import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { LabeledGroup } from "../widgets/LabeledGroup.js";
import { Text } from "../widgets/Text.js";
import {
  RecipeInstructionRowView,
  type RecipeInstructionRow,
} from "./RecipeInstructionRowView.js";
import { useVoice } from "../voice/index.js";

export type { RecipeInstructionRow };

export type RecipeInstructionListViewProps = {
  /** Section label. Defaults to the voice object's recipeInstructionListView label (#539). */
  label?: string;
  /** The rows, in display order (the #124 view-models). */
  rows: RecipeInstructionRow[];
  /** Shown when the list is empty. Defaults to the voice object's recipeInstructionListView empty message (#539). */
  emptyMessage?: string;
  /** The add action's label. Defaults to the voice object's recipeInstructionListView add label (#539). */
  addLabel?: string;
  /** Add intent: the host appends its own empty row (it owns
   * row keys and shape defaults). Renders the add action —
   * in the label row, where the hosts put it — only when
   * provided. */
  onAdd?: () => void;
  /** Body-change intent from a row: its key and the new text. */
  onBodyChange?: (rowKey: string, value: string) => void;
  /** Remove intent from a row: its key. */
  onRemove?: (rowKey: string) => void;
  /**
   * Binds the host's drag handle for a row (Stephen's
   * 2026-11-09 boundary on #130): the host's drag container
   * renders its handle through this — for web, a component
   * holding its sortable activator; the design system itself
   * renders no handle and takes no drag dependency. A native
   * host whose container IS the list (DraggableFlatList)
   * renders RecipeInstructionRowView from its own renderItem
   * instead and passes the handle to the row directly.
   */
  renderDragHandle?: (row: RecipeInstructionRow, index: number) => ReactNode;
};

/**
 * RecipeInstructionListView (#130, tranche T4): the recipe
 * form's instruction list chrome as a view — the labeled
 * section, the add action in its label row, the empty state,
 * and the rows (RecipeInstructionRowView) in order — landing
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
 * no reorder callback, enters the design system. Step
 * numbers are positional: they re-derive from the new order
 * on the next render.
 */
export function RecipeInstructionListView({
  label: labelProp,
  rows,
  emptyMessage: emptyMessageProp,
  addLabel: addLabelProp,
  onAdd,
  onBodyChange,
  onRemove,
  renderDragHandle,
}: RecipeInstructionListViewProps) {
  const voice = useVoice();
  const label = labelProp ?? voice.recipeInstructionListView.label;
  const emptyMessage = emptyMessageProp ?? voice.recipeInstructionListView.emptyMessage;
  const addLabel = addLabelProp ?? voice.recipeInstructionListView.addLabel;
  return (
    <LabeledGroup
      label={label}
      action={
        onAdd ? (
          <Button
            ghost
            size="sm"
            accessibilityLabel={voice.recipeInstructionListView.addInstructionLabel}
            onPress={onAdd}
          >
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
            <RecipeInstructionRowView
              key={row.key}
              row={row}
              index={index}
              {...(renderDragHandle ? { dragHandle: renderDragHandle(row, index) } : {})}
              {...(onBodyChange ? { onBodyChange } : {})}
              {...(onRemove ? { onRemove } : {})}
            />
          ))}
        </YStack>
      )}
    </LabeledGroup>
  );
}
