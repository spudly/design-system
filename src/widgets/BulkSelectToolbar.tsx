import { XStack, YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { tokens } from "../tokens/index.js";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { Button } from "./Button.js";
import { SkeletonBone } from "./SkeletonClock.js";
import { Text } from "./Text.js";
import { LINE_BOXES } from "./TextSkeleton.js";
import { SearchField } from "../views/SearchField.js";

export type BulkSelectToolbarProps = {
  search: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder?: string;
  selectedCount: number;
  /** How many items the current filter shows; Select all disables at zero. */
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
 * instead of hugging the top of the row (#175). Select all
 * disables when the controls are disabled or busy, or when the filter
 * shows nothing; Clear selection disables when the controls are
 * disabled or busy, or when nothing is selected — a selection can
 * always be cleared, even when the current filter (or an error state
 * in the caller) hides the selected items. Selection state is the
 * caller's — the toolbar only reports presses and renders the counts
 * it is given.
 *
 * Loading (#278): inside an active LoadingScope the toolbar
 * skeletonizes with the composite it belongs to — the ghost
 * buttons bone through Button's own scope handling, the search
 * field renders as a field-shaped bone at the field's own box
 * (its measured row height, its corner radius), and the
 * selection count renders as a text bone in its slot, sized from
 * the count text the way Button sizes a ghost label bone. No
 * live input, placeholder, or real count shows while loading:
 * the search filters the very list that is loading, and the
 * count describes that list's selection, so both are content
 * the skeleton stands in for (Stephen on #579).
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
  const showSkeleton = useLoadingScope();
  const selectedText = `${selectedCount} selected`;

  return (
    <YStack>
      {showSkeleton ? (
        // The search field's bone (#278): the field's own box —
        // measured against the rendered field, its row is 46px:
        // the 44px glyph box plus the container's two 1px
        // borders (a flat 44 left the toolbar below shifted up
        // by the borders). The bone's radius is the field's own
        // (radii.md). In the field's slot, the rows below keep
        // their places.
        <BoxSkeleton height={46} />
      ) : (
        <SearchField value={search} onChangeText={onSearchChange} placeholder={searchPlaceholder} />
      )}
      <XStack flexWrap="wrap" alignItems="center" gap="$3" paddingBlockEnd="$3">
        <Button
          ghost
          size="sm"
          disabled={controlsDisabled || filteredCount === 0}
          onPress={onSelectAll}
        >
          {selectAllLabel}
        </Button>
        <Button
          ghost
          size="sm"
          disabled={controlsDisabled || selectedCount === 0}
          onPress={onClearSelection}
        >
          {clearSelectionLabel}
        </Button>
        {selectedCount > 0 ? (
          showSkeleton ? (
            // The count's bone (#278): one text bone in the
            // count's slot — the hint size's bone height, the
            // width estimated from the count text the way
            // Button estimates a ghost label bone's width.
            <SkeletonBone
              width={Math.max(
                24,
                Math.round(selectedText.length * tokens.typography.fontSize.sm * 0.52),
              )}
              height={LINE_BOXES.sm.bone}
              borderRadius={tokens.radii.md}
            />
          ) : (
            <Text variant="hint">{selectedText}</Text>
          )
        ) : null}
      </XStack>
    </YStack>
  );
}
