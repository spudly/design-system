import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { CheckboxField } from "../views/CheckboxField.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { EmptyState } from "./EmptyState.js";
import { LoadingScope, useLoadingScope } from "./LoadingScope.js";
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
// rows, from a frozen module-level constant with stable keys —
// never generated per render. Each row mirrors a CheckboxField
// row's geometry (a 24dp box beside one label line at the 44dp
// touch-target height) and is inert: no checkbox, no toggle.
const LOADING_ROW_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

/**
 * Multi-select list of labeled checkboxes with loading and empty states:
 * while `loading`, exactly 3 skeleton rows in the checkbox rows'
 * geometry (the centered spinner this list used before #278's
 * skeleton conversion is gone — a list's loading state mirrors
 * the list); with no items, an EmptyState carrying
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
    return (
      <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        <LoadingScope active>
          {LOADING_ROW_KEYS.map((key) => (
            <XStack key={key} alignItems="center" gap={tokens.spacing[3]} minHeight={44}>
              <BoxSkeleton width={24} height={24} />
              <YStack flex={1}>
                <TextSkeleton lines={1} />
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
