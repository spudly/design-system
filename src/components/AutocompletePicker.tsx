import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { ListRow } from "./ListRow.js";
import { SearchField } from "./SearchField.js";
import { Spinner } from "./Spinner.js";
import { Text } from "./Text.js";

export type AutocompletePickerResult = {
  /** Stable id of the result — selection and removal report it. */
  id: string;
  /** The result's label (e.g. a recipe's title). */
  label: string;
  /**
   * Optional detail line under the label, pre-composed by the
   * caller (e.g. "4 servings"). The picker is generic — what
   * the detail says is the caller's domain, not the picker's.
   */
  detail?: string;
};

export type AutocompletePickerSelectedItem = {
  /** Stable id of the selected item — removal reports it. */
  id: string;
  /** The selected item's label. */
  label: string;
};

export type AutocompletePickerProps = {
  /** The search text, controlled by the caller. */
  searchText: string;
  /**
   * Reports every search-text change. The caller runs the
   * search itself (server-side, in the form pages' hosts) and
   * feeds the outcome back through `searchResults` /
   * `isSearching` — the picker never fetches.
   */
  onSearchTextChange: (text: string) => void;
  /**
   * Results for the current `searchText`, in the caller's
   * order. Results whose id is already selected are not
   * rendered again — a selected item cannot be added twice.
   */
  searchResults: AutocompletePickerResult[];
  /** A search is in flight: a spinner replaces the results. */
  isSearching?: boolean;
  /** Called with the id of the result the user picked. The
   * caller adds it to `selectedItems`; the picker stays
   * mounted and ready to add more. */
  onSelectResult: (id: string) => void;
  /** The selected items, in selection order. They cross as
   * full view-models — under a server-side search the caller
   * cannot look a selection up in the results, so the label
   * it renders by must travel with the selection itself. */
  selectedItems: AutocompletePickerSelectedItem[];
  /** Called with the id of the selected item whose Remove
   * action was pressed. */
  onRemoveSelectedItem: (id: string) => void;
  /** The search field's placeholder. */
  placeholder?: string;
  /** Accessible name for the search field (its visible label,
   * when the caller gives the picker one, is the caller's
   * LabeledGroup — the field itself carries this name). */
  searchAccessibilityLabel?: string;
  /** Shown when a non-empty search returns no results.
   * Defaults to "No results found." */
  noResultsMessage?: string;
  /** Disables the search field, the results, and removal. */
  disabled?: boolean;
};

/**
 * Multi-select search autocomplete (#383): a SearchField, the
 * caller's results for the current search text as pressable
 * rows, and the selected items as a removable list — the
 * replacement for rendering a full checkbox list of every
 * option in the meal forms, where the library the host
 * searches is far larger than a form should list.
 *
 * The contract is the DS controlled pattern throughout:
 * - The search is the caller's. `searchText` crosses in,
 *   `onSearchTextChange` reports out, and the caller runs its
 *   (server-side) search and feeds `searchResults` and
 *   `isSearching` back in. While `isSearching`, a Spinner
 *   replaces the results — the previous results are stale for
 *   the new text and must not be selectable.
 * - Results render only once there is search text: an empty
 *   search is the pre-search state and shows no result area
 *   at all, and a non-empty search with no (unselected)
 *   results shows `noResultsMessage` instead of blank space.
 * - Selection is multi: picking a result reports its id
 *   through `onSelectResult` and the picker stays available
 *   to add more; the caller appends the item to
 *   `selectedItems`, whose rows each carry a Remove action
 *   reporting through `onRemoveSelectedItem`. What a
 *   selection means beyond the list — the meal forms'
 *   servings steppers, say — is the caller's composition
 *   around the picker, driven by the same selected
 *   view-models the caller passes in.
 *
 * The picker owns its styling completely (#119): the search
 * field is the DS SearchField, result rows are DS ListRows,
 * removal is a ghost DS Button, and the stacks are the
 * picker's own layout — callers pass data and callbacks only.
 */
export function AutocompletePicker({
  searchText,
  onSearchTextChange,
  searchResults,
  isSearching = false,
  onSelectResult,
  selectedItems,
  onRemoveSelectedItem,
  placeholder = "Search…",
  searchAccessibilityLabel = "Search",
  noResultsMessage = "No results found.",
  disabled = false,
}: AutocompletePickerProps) {
  const selectedIds = new Set(selectedItems.map((item) => item.id));
  const visibleResults = searchResults.filter((result) => !selectedIds.has(result.id));
  const hasSearchText = searchText.trim().length > 0;

  return (
    <YStack gap={tokens.spacing[2]}>
      <SearchField
        value={searchText}
        onChangeText={onSearchTextChange}
        placeholder={placeholder}
        aria-label={searchAccessibilityLabel}
        disabled={disabled}
      />
      {hasSearchText ? (
        isSearching ? (
          <YStack alignItems="center" padding={tokens.spacing[3]}>
            <Spinner label="Searching" />
          </YStack>
        ) : visibleResults.length === 0 ? (
          <Text variant="hint">{noResultsMessage}</Text>
        ) : (
          <YStack>
            {visibleResults.map((result) => (
              <ListRow
                key={result.id}
                title={result.label}
                {...(result.detail !== undefined ? { subtitle: result.detail } : {})}
                isDisabled={disabled}
                onPress={() => {
                  onSelectResult(result.id);
                }}
              />
            ))}
          </YStack>
        )
      ) : null}
      {selectedItems.length > 0 ? (
        <YStack>
          {selectedItems.map((item) => (
            <XStack
              key={item.id}
              alignItems="center"
              justifyContent="space-between"
              gap={tokens.spacing[3]}
              paddingVertical={tokens.spacing[2]}
            >
              <Text flex={1}>{item.label}</Text>
              <Button
                variant="ghost"
                size="sm"
                accessibilityLabel={`Remove ${item.label}`}
                disabled={disabled}
                onPress={() => {
                  onRemoveSelectedItem(item.id);
                }}
              >
                Remove
              </Button>
            </XStack>
          ))}
        </YStack>
      ) : null}
    </YStack>
  );
}
