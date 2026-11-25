import { useId, useRef } from "react";
import { XStack, isWeb, styled } from "tamagui";
import type { TamaguiElement } from "tamagui";
import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { politeLiveRegionProps } from "../accessibility.js";
import { Alert } from "../feedback/Alert.js";
import { Badge } from "../data/Badge.js";
import { ListItem } from "../data/ListItem.js";
import { SearchField } from "./SearchField.js";
import { Spinner } from "../feedback/Spinner.js";
import { Text } from "../data/Text.js";
import { FieldError } from "./FieldError.js";
import { useVoice } from "../../voice/index.js";

/**
 * The bordered field frame holding the selected chips and the
 * (embedded, borderless) search field (#805): it carries the
 * SearchField container's own border/focus treatment — the
 * $textMuted border (≥3:1, WCAG 1.4.11, as in SearchField) and
 * the focus-within ring — so the composite reads as one field.
 */
const StyledFieldFrame = styled(XStack, {
  name: "AutocompletePickerFieldFrame",

  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$textMuted",
  borderRadius: tokens.radii.md,
  paddingHorizontal: tokens.spacing[2],
  paddingVertical: tokens.spacing[1],
  alignItems: "center",
  flexWrap: "wrap",
  gap: tokens.spacing[2],
  outlineWidth: "0px focus-within:2px",
  outlineStyle: "none focus-within:solid",
  outlineColor: "$link",
  outlineOffset: 2,
});

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
  /** The search field's placeholder. Defaults to the voice object's autocompletePicker search placeholder (#539). */
  placeholder?: string;
  /** Accessible name for the search field (its visible label,
   * when the caller gives the picker one, is the caller's
   * LabeledGroup — the field itself carries this name).
   * Defaults to the voice object's autocompletePicker search label (#539). */
  searchAccessibilityLabel?: string;
  /** Shown when a non-empty search returns no results.
   * Defaults to the voice object's autocompletePicker no-results message (#539). */
  noResultsMessage?: string;
  /**
   * The caller's search failed (e.g. "Could not load
   * recipes: …"). While set, the empty state renders this
   * error — and the live region announces it — INSTEAD of
   * `noResultsMessage`: a failed search must never read as
   * "no matches" (#393). Pass search failures here rather
   * than only in a surrounding form's error slot, so the
   * picker itself never contradicts the error. Cleared by
   * the caller when a search succeeds again.
   */
  searchError?: string | null | undefined;
  /**
   * Validation error for the picker's selection as a whole
   * (#804) — distinct from `searchError` (a failed search):
   * rendered below the picker through the shared FieldError
   * (an Alert), wired to the search input with `aria-invalid`
   * / `aria-describedby` at `${id}-error`.
   */
  error?: string | null | undefined;
  id?: string;
  /** Disables the search field, the results, and removal. */
  disabled?: boolean;
};

/**
 * Multi-select search autocomplete (#383): a SearchField, the
 * caller's results for the current search text as pressable
 * rows, and the selected items as removable Badge chips inside
 * the field itself (#805) — the replacement for rendering a
 * full checkbox list of every option in the meal forms, where
 * the library the host searches is far larger than a form
 * should list.
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
 * - A failed search is its own state (#393): while the
 *   caller passes `searchError`, the empty state renders the
 *   error and the live region announces it instead of the
 *   no-results message — "search failed" and "search matched
 *   nothing" never share a message.
 * - Selection is multi: picking a result reports its id
 *   through `onSelectResult` and the picker stays available
 *   to add more; the caller appends the item to
 *   `selectedItems`, which render as removable Badge chips
 *   inside the field frame (#805 — the Jira pattern: chips and
 *   the search input share one bordered field, the chips in a
 *   wrapping row and the embedded SearchField flexing beside
 *   them), each chip's × reporting through
 *   `onRemoveSelectedItem`. What a selection means beyond the
 *   chips — the meal forms' servings steppers, say — is the
 *   caller's composition around the picker, driven by the
 *   same selected view-models the caller passes in.
 *
 * The picker owns its styling completely (#119): the search
 * field is the DS SearchField (in its embedded, borderless
 * form inside the picker's field frame), result rows are DS
 * ListItems, selected items are DS Badges in their removable
 * form, and the stacks are the picker's own layout — callers
 * pass data and callbacks only.
 *
 * Search-state announcements: an always-mounted polite live
 * region (the StatusMessage pattern — `politeLiveRegionProps`
 * on a `collapsable={false}` root that renders in every state)
 * carries the search state's text: searching, the no-results
 * message, or how many results are available. A live region
 * only announces changes that happen after it mounts, so the
 * region must exist before the search state changes — the
 * conditionally rendered no-results hint below cannot announce
 * anything (it mounts WITH its text). The region's text is
 * announcement-only: the visible counterparts (the Spinner,
 * the hint, the rows) are unchanged, so the region is clipped
 * to a 1×1 box — present in the accessibility tree, absent
 * from the layout. Full transparency is WEB ONLY: on iOS an
 * alpha-0 view drops out of VoiceOver's accessibility tree
 * entirely, so native keeps the 1×1 clipped box opaque and
 * VoiceOver still reads the announcements.
 *
 * Focus on selection and removal: picking a result unmounts
 * its row (the caller adds it to `selectedItems`, and selected
 * results are filtered out of the rows), and removing a
 * selected item likewise unmounts its Remove button — either
 * would strand a keyboard user's focus on the page body.
 * Selection and removal therefore both return focus to the
 * search input — the stable target, and where the user
 * continues, since the picker stays open to add more —
 * through the SearchField's forwarded input ref.
 */
export function AutocompletePicker({
  searchText,
  onSearchTextChange,
  searchResults,
  isSearching = false,
  onSelectResult,
  selectedItems,
  onRemoveSelectedItem,
  placeholder: placeholderProp,
  searchAccessibilityLabel: searchAccessibilityLabelProp,
  noResultsMessage: noResultsMessageProp,
  searchError,
  error,
  id: idProp,
  disabled = false,
}: AutocompletePickerProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  const voice = useVoice();
  const placeholder = placeholderProp ?? voice.autocompletePicker.searchPlaceholder;
  const searchAccessibilityLabel =
    searchAccessibilityLabelProp ?? voice.autocompletePicker.searchLabel;
  const noResultsMessage = noResultsMessageProp ?? voice.autocompletePicker.noResultsMessage;
  const selectedIds = new Set(selectedItems.map((item) => item.id));
  const visibleResults = searchResults.filter((result) => !selectedIds.has(result.id));
  const hasSearchText = searchText.trim().length > 0;
  const searchFieldRef = useRef<TamaguiElement>(null);

  // The live region's text for the current search state (see
  // the announcement note above): nothing before a search,
  // then exactly one of searching / the search error / no
  // matches / the count of results on offer. A failed search
  // (searchError set, no results) announces the error, never
  // the no-results message (#393).
  const statusMessage = !hasSearchText
    ? null
    : isSearching
      ? voice.autocompletePicker.searchingLabel
      : visibleResults.length === 0
        ? searchError || noResultsMessage
        : voice.autocompletePicker.resultsAvailableLabel(visibleResults.length);

  // Both the select and remove paths unmount the control the
  // user just activated (the result row is filtered out as
  // selected; the selected item's chip leaves the field), so
  // focus would fall to the page body; return it to the
  // search input instead (see the focus note above). The
  // input element carries `focus()` on web and the TextInput
  // instance carries it on native; the optional call (the
  // DropdownButton pattern) keeps this a no-op anywhere no
  // focus method exists.
  const returnFocusToSearch = () => {
    const node = searchFieldRef.current as unknown as { focus?: () => void } | null;
    node?.focus?.();
  };

  const handleSelectResult = (id: string) => {
    onSelectResult(id);
    returnFocusToSearch();
  };

  const handleRemoveSelectedItem = (id: string) => {
    onRemoveSelectedItem(id);
    returnFocusToSearch();
  };

  return (
    <Col gap="s" position="relative">
      <StyledFieldFrame testID="autocomplete-picker-field">
        {selectedItems.map((item) => (
          <Badge
            key={item.id}
            // Badge's own alignSelf guard pins it to the start of
            // the cross axis, which in this row frame would hug the
            // top of the line the taller search field sets — the
            // chip must instead center on that line, level with
            // the input's content.
            alignSelf="center"
            disabled={disabled}
            onRemove={() => {
              handleRemoveSelectedItem(item.id);
            }}
            removeAccessibilityLabel={voice.autocompletePicker.removeItemLabel(item.label)}
          >
            {item.label}
          </Badge>
        ))}
        <SearchField
          ref={searchFieldRef}
          embedded
          grow
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={searchText}
          onChangeText={onSearchTextChange}
          placeholder={placeholder}
          aria-label={searchAccessibilityLabel}
          disabled={disabled}
        />
      </StyledFieldFrame>
      <Col
        collapsable={false}
        {...politeLiveRegionProps}
        position="absolute"
        width={1}
        height={1}
        overflow="hidden"
        {...(isWeb ? { opacity: 0 } : {})}
      >
        {statusMessage ? <Text>{statusMessage}</Text> : null}
      </Col>
      {hasSearchText ? (
        isSearching ? (
          <Col center p="m">
            <Spinner label={voice.autocompletePicker.searchingLabel} />
          </Col>
        ) : visibleResults.length === 0 ? (
          searchError ? (
            // The visible Alert carries NO live semantics of its
            // own: an error Alert's assertive role would announce
            // the error a second time (and interrupt), on top of
            // the polite live region above, which already announces
            // it. The Alert's caller overrides are the off switch:
            // accessibilityRole="none" removes the alert role
            // itself (an alert role can fire a system alert event
            // even with aria-live="off"), and
            // accessibilityLiveRegion="none" clears the live
            // region (aria-live="off" on web) — the polite region
            // above stays the only announcement.
            <Alert
              severity="error"
              message={searchError}
              accessibilityRole="none"
              accessibilityLiveRegion="none"
            />
          ) : (
            <Text variant="hint">{noResultsMessage}</Text>
          )
        ) : (
          <Col>
            {visibleResults.map((result) => (
              <ListItem
                key={result.id}
                title={result.label}
                {...(result.detail !== undefined ? { subtitle: result.detail } : {})}
                isDisabled={disabled}
                onPress={() => {
                  handleSelectResult(result.id);
                }}
              />
            ))}
          </Col>
        )
      ) : null}
      {error ? <FieldError error={error} id={errorId} /> : null}
    </Col>
  );
}
