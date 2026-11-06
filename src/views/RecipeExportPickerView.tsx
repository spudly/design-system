import { ScrollView, YStack } from "tamagui";
import { Alert } from "../widgets/Alert.js";
import { BulkSelectToolbar } from "../widgets/BulkSelectToolbar.js";
import { Button } from "../widgets/Button.js";
import { CheckboxSelectList } from "../widgets/CheckboxSelectList.js";
import { tokens } from "../tokens/index.js";

export type RecipeExportPickerViewItem = {
  id: string;
  label: string;
};

export type RecipeExportPickerViewProps = {
  /** The search text; the host filters `items` by it. */
  search: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder?: string;
  /** The filtered items to offer for selection. */
  items: RecipeExportPickerViewItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
  /** The item query is in flight: the list renders its spinner. */
  loading?: boolean;
  /** The item query failed: renders this message instead of the list and its empty state. */
  error?: string | null;
  emptyMessage?: string;
  exporting?: boolean;
  onExport: () => void;
  /** The host composes the label with its count ("Export selected (3)"). */
  exportLabel: string;
  exportPendingLabel?: string;
};

/**
 * RecipeExportPickerView (#438 Part 3): the bulk recipe-export
 * picker as a view — the BulkSelectToolbar over a bounded
 * CheckboxSelectList with the export action — composed from
 * the shared widgets so hosts no longer import those widgets
 * (and the Spinner the list renders while loading) to build
 * the picker themselves (the eciperay audit's coverage
 * disposition for those specifiers).
 *
 * Filtering and selection state stay with the caller: the
 * host filters the items by the search text, holds the
 * selection as an id list, and runs the export; the view
 * renders the bounded scroll region the host section framed
 * the list with and reports the intents.
 */
export function RecipeExportPickerView({
  search,
  onSearchChange,
  searchPlaceholder = "Search recipes…",
  items,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearSelection,
  disabled = false,
  loading = false,
  error,
  emptyMessage = "No recipes to export yet.",
  exporting = false,
  onExport,
  exportLabel,
  exportPendingLabel = "Exporting…",
}: RecipeExportPickerViewProps) {
  return (
    <YStack gap="$3">
      <BulkSelectToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        selectedCount={selectedIds.length}
        // While the error state hides the items behind the alert, the
        // toolbar must see an empty visible set: Select all disables
        // instead of selecting items the user cannot see. An existing
        // selection can still be cleared (the toolbar gates Clear on
        // the selection, not the visible count).
        filteredCount={error ? 0 : items.length}
        disabled={disabled}
        busy={exporting}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
      />
      <YStack
        borderWidth={1}
        borderColor={tokens.colors.gray.gray3}
        borderRadius={tokens.radii.xl}
        maxHeight={256}
        overflow="hidden"
      >
        <ScrollView>
          {error ? (
            <Alert severity="error" message={error} />
          ) : (
            <CheckboxSelectList
              items={items}
              selectedIds={selectedIds}
              onToggle={onToggle}
              disabled={disabled || exporting}
              loading={loading}
              emptyMessage={emptyMessage}
            />
          )}
        </ScrollView>
      </YStack>
      <Button
        variant="primary"
        disabled={disabled || exporting || selectedIds.length === 0}
        onPress={onExport}
      >
        {exporting ? exportPendingLabel : exportLabel}
      </Button>
    </YStack>
  );
}
