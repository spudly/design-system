import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { CheckboxField } from "./CheckboxField.js";
import { EmptyState } from "./EmptyState.js";
import { Spinner } from "./Spinner.js";

export type CheckboxSelectItem = {
  id: string;
  label: string;
};

export type CheckboxSelectListProps = {
  items: CheckboxSelectItem[];
  /** Ids of the selected items (the multi-select convention: a plain array). */
  selectedIds: string[];
  /** Called with the id of the item whose checkbox was toggled. */
  onToggle: (id: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  /** Shown through EmptyState when there are no items. */
  emptyMessage?: string;
};

/**
 * Multi-select list of labeled checkboxes with loading and empty states:
 * while `isLoading`, a centered Spinner; with no items, an EmptyState
 * carrying `emptyMessage`; otherwise one CheckboxField per item, checked
 * when its id is in `selectedIds`. Selection state is the caller's —
 * `onToggle` reports the toggled id and the caller updates `selectedIds`.
 */
export function CheckboxSelectList({
  items,
  selectedIds,
  onToggle,
  disabled = false,
  isLoading = false,
  emptyMessage = "No items found.",
}: CheckboxSelectListProps) {
  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding={tokens.spacing[4]}>
        <Spinner />
      </YStack>
    );
  }
  if (items.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }
  const selected = new Set(selectedIds);
  return (
    <YStack>
      {items.map((item) => (
        <CheckboxField
          key={item.id}
          label={item.label}
          checked={selected.has(item.id)}
          onCheckedChange={() => {
            onToggle(item.id);
          }}
          disabled={disabled}
        />
      ))}
    </YStack>
  );
}
