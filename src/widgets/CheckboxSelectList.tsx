import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { CheckboxField } from "../views/CheckboxField.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { EmptyState } from "./EmptyState.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { TextSkeleton } from "./TextSkeleton.js";

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
  loading?: boolean;
  /** Shown through EmptyState when there are no items. */
  emptyMessage?: string;
};

// The loading list's dummy rows (#278): exactly 3 placeholder
// rows for a list whose items are not known yet, from a frozen
// module-level constant with stable keys — never generated per
// render (the TagList convention). When the items ARE known,
// the skeleton renders one row per item instead: a fixed dummy
// count taller or shorter than the loaded list slides
// everything below the list off its loaded position (Stephen
// on #579). Each row mirrors a CheckboxField row's geometry
// exactly: the field's 24dp visual box is centered in a 44dp
// touch target, and its label starts after that target plus
// the row gap — so the box bone sits in a 44x44 slot (not at
// the row's left edge) and the label bone follows it. The row
// is inert: no checkbox, no toggle.
const LOADING_ROW_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

/**
 * Multi-select list of labeled checkboxes with loading and empty states:
 * while `loading`, skeleton rows in the checkbox rows' geometry
 * — one per item when the items are known, or exactly 3 dummy
 * rows when they are not (the centered spinner this list used
 * before #278's skeleton conversion is gone — a list's loading
 * state mirrors the list); with no items, an EmptyState carrying
 * `emptyMessage`; otherwise one CheckboxField per item, checked
 * when its id is in `selectedIds`. Selection state is the
 * caller's — `onToggle` reports the toggled id and the caller
 * updates `selectedIds`. An enclosing composite's LoadingScope
 * can also put the list into its loading state.
 */
export function CheckboxSelectList({
  items,
  selectedIds,
  onToggle,
  disabled = false,
  loading = false,
  emptyMessage = "No items found.",
}: CheckboxSelectListProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // One row per known item, keyed by the item's id; the
    // frozen dummy keys stand in only when the list is not
    // known yet.
    const rowKeys = items.length > 0 ? items.map((item) => item.id) : LOADING_ROW_KEYS;
    return (
      <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        <LoadingScope active>
          {rowKeys.map((key) => (
            <XStack key={key} alignItems="center" gap={tokens.spacing[3]} minHeight={44}>
              <View width={44} height={44} alignItems="center" justifyContent="center">
                <BoxSkeleton width={24} height={24} />
              </View>
              <YStack flex={1}>
                <TextSkeleton size="md" lines={1} />
              </YStack>
            </XStack>
          ))}
        </LoadingScope>
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
