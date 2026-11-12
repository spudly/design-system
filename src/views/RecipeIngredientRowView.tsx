import type { ReactNode } from "react";
import { Button } from "../widgets/Button.js";
import { FieldRow } from "../widgets/FieldRow.js";
import { TextField } from "./TextField.js";

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
   * and actions for assistive tech ("Ingredient 2 quantity"). */
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
 * fields, the host-bound drag handle, and the remove action,
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
  const position = index + 1;
  return (
    <FieldRow>
      {dragHandle ?? null}
      <TextField
        accessibilityLabel={`Ingredient ${position} quantity`}
        placeholder="Qty"
        readOnly={onFieldChange === undefined}
        value={row.quantity}
        onChangeText={(value) => {
          onFieldChange?.(row.key, "quantity", value);
        }}
      />
      <TextField
        accessibilityLabel={`Ingredient ${position} unit`}
        placeholder="Unit"
        readOnly={onFieldChange === undefined}
        value={row.unit}
        onChangeText={(value) => {
          onFieldChange?.(row.key, "unit", value);
        }}
      />
      <TextField
        grow
        accessibilityLabel={`Ingredient ${position} name`}
        placeholder="Name"
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
          accessibilityLabel={`Remove ingredient ${position}`}
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
