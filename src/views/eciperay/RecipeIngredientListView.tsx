import type { ReactNode } from "react";
import { DragHandleView } from "./DragHandleView.js";
import { LabeledListSection } from "./LabeledListSection.js";
import {
  RecipeIngredientRowView,
  type RecipeIngredientField,
  type RecipeIngredientRow,
} from "./RecipeIngredientRowView.js";
import { useVoice } from "../../voice/index.js";

export type { RecipeIngredientField, RecipeIngredientRow };

export type RecipeIngredientListViewProps = {
  /** Section label. Defaults to the voice object's recipeIngredientListView label (#539). */
  label?: string;
  /** The rows, in display order (the #124 view-models). */
  rows: RecipeIngredientRow[];
  /** Shown when the list is empty. Defaults to the voice object's recipeIngredientListView empty message (#539). */
  emptyMessage?: string;
  /** The add action's label. Defaults to the voice object's recipeIngredientListView add label (#539). */
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
   * Binds the host's drag handle for a row, overriding the
   * design system's own grip (Stephen's 2026-11-26 boundary
   * revision on #878: the DS owns the handle visual — the
   * DragHandleView grip — and hosts keep drag behavior; no
   * drag library enters the DS). When provided, the host's
   * handle wins exactly as before — for web, a component
   * holding its sortable activator. When omitted, each row
   * renders the default DS grip (DragHandleView). A native
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
 * the sortable-list build under Stephen's drag boundary as
 * revised 2026-11-26 on #878: the DS owns the row views, the
 * list chrome, and the drag-handle visual (DragHandleView,
 * rendered by default), emitting field-change / add / remove
 * intents; hosts keep their drag containers and behavior,
 * and may still bind their own handle through
 * `renderDragHandle` instead of the default grip.
 *
 * The list is controlled and owns no state: rows cross as
 * view-models, edits and removals report the row's key, an
 * add is a bare intent (the host mints the new row's key),
 * and a reorder performed in the host's drag container
 * crosses back as a new `rows` array — no drag library, and
 * no reorder callback, enters the design system.
 */
export function RecipeIngredientListView({
  label: labelProp,
  rows,
  emptyMessage: emptyMessageProp,
  addLabel: addLabelProp,
  onAdd,
  onFieldChange,
  onRemove,
  renderDragHandle,
}: RecipeIngredientListViewProps) {
  const voice = useVoice();
  const label = labelProp ?? voice.recipeIngredientListView.label;
  const emptyMessage = emptyMessageProp ?? voice.recipeIngredientListView.emptyMessage;
  const addLabel = addLabelProp ?? voice.recipeIngredientListView.addLabel;
  return (
    <LabeledListSection
      label={label}
      addLabel={addLabel}
      addAccessibilityLabel={voice.recipeIngredientListView.addIngredientLabel}
      emptyMessage={emptyMessage}
      isEmpty={rows.length === 0}
      {...(onAdd ? { onAdd } : {})}
    >
      {rows.map((row, index) => (
        <RecipeIngredientRowView
          key={row.key}
          row={row}
          index={index}
          dragHandle={renderDragHandle ? renderDragHandle(row, index) : <DragHandleView />}
          {...(onFieldChange ? { onFieldChange } : {})}
          {...(onRemove ? { onRemove } : {})}
        />
      ))}
    </LabeledListSection>
  );
}
