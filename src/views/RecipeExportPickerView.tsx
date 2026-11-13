import { ScrollView, YStack } from "tamagui";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { Alert } from "../widgets/Alert.js";
import { BulkSelectToolbar } from "../widgets/BulkSelectToolbar.js";
import { Button } from "../widgets/Button.js";
import { CheckboxSelectList } from "../widgets/CheckboxSelectList.js";
import { tokens } from "../tokens/index.js";
import { useVoice } from "../voice/index.js";

export type RecipeExportPickerViewItem = {
  id: string;
  label: string;
};

export type RecipeExportPickerViewProps = {
  /** The search text; the host filters `items` by it. */
  search: string;
  onSearchChange: (text: string) => void;
  /** Defaults to the voice object's recipeExportPickerView searchPlaceholder (#539). */
  searchPlaceholder?: string;
  /** The filtered items to offer for selection. */
  items: RecipeExportPickerViewItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
  /** Loading state (#278): the list renders its skeleton rows
   * through the CheckboxSelectList, the bordered list frame's
   * border turns transparent (no visible hairline), and the
   * whole view renders inside a LoadingScope so the toolbar
   * (its Buttons, its search field, and its selection count)
   * and the Export Button render as inert skeletons at their
   * normal geometry; the error is hidden and no real item
   * labels show. An enclosing composite's LoadingScope can
   * also put the picker into this state without prop-drilling. */
  loading?: boolean;
  /** The item query failed: renders this message instead of the list and its empty state. */
  error?: string | null;
  /** Defaults to the voice object's recipeExportPickerView emptyMessage (#539). */
  emptyMessage?: string;
  exporting?: boolean;
  onExport: () => void;
  /** The host composes the label with its count ("Export selected (3)"). */
  exportLabel: string;
  /** Defaults to the voice object's recipeExportPickerView exportPendingLabel (#539). */
  exportPendingLabel?: string;
};

/**
 * RecipeExportPickerView (#438 Part 3): the bulk recipe-export
 * picker as a view — the BulkSelectToolbar over a bounded
 * CheckboxSelectList with the export action — composed from
 * the shared widgets so hosts no longer import those widgets
 * (and the skeleton rows the list renders while loading) to
 * build the picker themselves (the eciperay audit's coverage
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
  searchPlaceholder: searchPlaceholderProp,
  items,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearSelection,
  disabled = false,
  loading = false,
  error,
  emptyMessage: emptyMessageProp,
  exporting = false,
  onExport,
  exportLabel,
  exportPendingLabel: exportPendingLabelProp,
}: RecipeExportPickerViewProps) {
  const voice = useVoice();
  const searchPlaceholder =
    searchPlaceholderProp ?? voice.recipeExportPickerView.searchPlaceholder;
  const emptyMessage = emptyMessageProp ?? voice.recipeExportPickerView.emptyMessage;
  const exportPendingLabel =
    exportPendingLabelProp ?? voice.recipeExportPickerView.exportPendingLabel;
  const showSkeleton = useLoadingScope(loading);
  return (
    <LoadingScope active={showSkeleton}>
      <YStack gap="$3">
        {/* The toolbar stays rendered inside the scope while
            loading (#278): it reads the scope itself — its
            ghost Buttons as text bones, its SearchField as a
            field-shaped bone, and its selection count as a
            text bone — so nothing in it renders live. */}
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
          borderColor={showSkeleton ? "transparent" : tokens.colors.gray.gray3}
          borderRadius={tokens.radii.xl}
          maxHeight={256}
          overflow="hidden"
        >
          <ScrollView>
            {error && !showSkeleton ? (
              <Alert severity="error" message={error} />
            ) : (
              <CheckboxSelectList
                items={items}
                selectedIds={selectedIds}
                onToggle={onToggle}
                disabled={disabled || exporting}
                loading={showSkeleton}
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
    </LoadingScope>
  );
}
