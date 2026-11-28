import type { ReactNode } from "react";

import { Button } from "../../widgets/actions/Button.js";
import { FieldRow } from "../../widgets/form/FieldRow.js";
import { TextField } from "../../widgets/form/TextField.js";
import { useVoice } from "../../voice/index.js";

/**
 * One ingredient row's view-model: the settled #124 row
 * contract. `key` is the host's stable row identity (its drag
 * containers key on it); quantity and unit cross as text —
 * the host parses numerics and folds nulls to "" on the way
 * in, the same text rule the recipe form's scalar fields use.
 */
export type RecipeIngredientRow = {
  key: string;
  quantity: string;
  unit: string;
  name: string;
};

export type RecipeIngredientField = "quantity" | "unit" | "name";

export type RecipeIngredientRowViewProps = {
  /** The row's view-model (the #124 contract above). */
  row: RecipeIngredientRow;
  /** The row's position in its list: names the row's fields
   * and actions for assistive tech, through the voice
   * object's recipeIngredientRowView formatters (#539). */
  index: number;
  /**
   * The drag handle for this row. Stephen's 2026-11-26
   * boundary revision on #878: the design system owns the
   * handle visual (DragHandleView's grip) and hosts keep
   * drag behavior — no drag library enters the DS. The list
   * view passes the DS grip by default, or the host's own
   * handle when the host binds one through its drag
   * container (dnd-kit on web, DraggableFlatList on native).
   * Omitted on a directly rendered row, the row renders
   * without a handle (a read-only-order context).
   */
  dragHandle?: ReactNode;
  /** Field-change intent: the row's key, the field, and the
   * new text. The host folds it into its form state. */
  onFieldChange?: (rowKey: string, field: RecipeIngredientField, value: string) => void;
  /** Remove intent: the row's key. Renders the remove action
   * only when provided. */
  onRemove?: (rowKey: string) => void;
};

/**
 * RecipeIngredientRowView (#130, tranche T4): one editable
 * ingredient row as a view — the quantity / unit / name
 * fields, the drag handle (the DS grip by default through
 * the list view, or host-bound), and the remove action,
 * composed from the DS fields so hosts no longer build the
 * row from raw inputs beside their drag containers.
 *
 * The row is controlled and owns no state: values cross as
 * the #124 view-model, every edit reports the row's key with
 * the field name, and reordering never enters the row — the
 * host's drag container owns the gesture and feeds the new
 * order back in as a new rows array on the list view. With
 * no field-change intent bound, the fields render
 * non-editable: a read-only rendering must not invite edits
 * it cannot report.
 */
export function RecipeIngredientRowView({
  row,
  index,
  dragHandle,
  onFieldChange,
  onRemove,
}: RecipeIngredientRowViewProps) {
  const voice = useVoice();
  const position = index + 1;
  return (
    <FieldRow>
      {dragHandle ?? null}
      {/* The quantity and unit fields carry fixed widths: left
          unconstrained in the flex row, each input renders at
          its intrinsic width (~233px on web), the two of them
          exhaust the row, the growing name field collapses to
          zero, and the row overflows its container. The widths
          fit the fields' content ("1 1/2", "tbsp") while the
          name field takes whatever width remains. */}
      <TextField
        accessibilityLabel={voice.recipeIngredientRowView.quantityLabel(position)}
        placeholder={voice.recipeIngredientRowView.quantityPlaceholder}
        width={68}
        readOnly={onFieldChange === undefined}
        value={row.quantity}
        onChangeText={(value) => {
          onFieldChange?.(row.key, "quantity", value);
        }}
      />
      <TextField
        accessibilityLabel={voice.recipeIngredientRowView.unitLabel(position)}
        placeholder={voice.recipeIngredientRowView.unitPlaceholder}
        width={84}
        readOnly={onFieldChange === undefined}
        value={row.unit}
        onChangeText={(value) => {
          onFieldChange?.(row.key, "unit", value);
        }}
      />
      <TextField
        grow
        accessibilityLabel={voice.recipeIngredientRowView.nameLabel(position)}
        placeholder={voice.recipeIngredientRowView.namePlaceholder}
        readOnly={onFieldChange === undefined}
        value={row.name}
        onChangeText={(value) => {
          onFieldChange?.(row.key, "name", value);
        }}
      />
      {onRemove ? (
        <Button
          variant="danger"
          size="sm"
          accessibilityLabel={voice.recipeIngredientRowView.removeIngredientLabel(position)}
          onPress={() => {
            onRemove(row.key);
          }}
        >
          {voice.recipeIngredientRowView.removeLabel}
        </Button>
      ) : null}
    </FieldRow>
  );
}
