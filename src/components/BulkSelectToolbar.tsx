import { XStack, YStack } from "tamagui";
import { Button } from "./Button.js";
import { SearchField } from "./SearchField.js";
import { Text } from "./Text.js";

export type BulkSelectToolbarProps = {
  search: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder?: string;
  selectedCount: number;
  /** How many items the current filter shows; selection actions disable at zero. */
  filteredCount: number;
  disabled?: boolean;
  /** A bulk operation is in flight: controls disable as if `disabled`. */
  busy?: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectAllLabel?: string;
  clearSelectionLabel?: string;
};

/**
 * Toolbar for bulk-selection lists: a search field over a wrapping row of
 * ghost select-all / clear-selection buttons and a hint-styled
 * "N selected" count (rendered only when something is selected). The row
 * centers its children vertically, so the count — a bare text element
 * without the buttons' vertical padding — sits on the buttons' midline
 * instead of hugging the top of the row (#175). The
 * selection buttons disable when the controls are disabled or busy, or
 * when the filter shows nothing. Selection state is the caller's — the
 * toolbar only reports presses and renders the counts it is given.
 */
export function BulkSelectToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  selectedCount,
  filteredCount,
  disabled = false,
  busy = false,
  onSelectAll,
  onClearSelection,
  selectAllLabel = "Select all",
  clearSelectionLabel = "Clear selection",
}: BulkSelectToolbarProps) {
  const controlsDisabled = disabled || busy;

  return (
    <YStack>
      <SearchField value={search} onChangeText={onSearchChange} placeholder={searchPlaceholder} />
      <XStack flexWrap="wrap" alignItems="center" gap="$3" paddingBlockEnd="$3">
        <Button
          variant="ghost"
          size="sm"
          disabled={controlsDisabled || filteredCount === 0}
          onPress={onSelectAll}
        >
          {selectAllLabel}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={controlsDisabled || filteredCount === 0}
          onPress={onClearSelection}
        >
          {clearSelectionLabel}
        </Button>
        {selectedCount > 0 ? <Text variant="hint">{selectedCount} selected</Text> : null}
      </XStack>
    </YStack>
  );
}
