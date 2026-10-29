import { useState, type ReactNode } from "react";
import { FlatList } from "react-native";
import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Alert } from "../components/Alert.js";
import { Button } from "../components/Button.js";
import { DiscoveryCard } from "../components/DiscoveryCard.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SearchField } from "../components/SearchField.js";
import { SelectField, type SelectOption } from "../components/SelectField.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * DiscoverPage (#168): Eciperay's public recipe catalog (the web
 * `/discover` route — public, no account needed) as a controlled
 * @spudly/ui page component. The app keeps all state and business
 * logic — the infinite query over its public-list endpoint,
 * filter state, subtitle formatting, permalink construction,
 * document-head/SEO — and drives this view entirely through
 * props: copy in, filter values in, change callbacks out, recipe
 * view-models in. Nothing here imports an app package or fetches
 * anything. The page is the content view only: the public chrome
 * (header/footer shell) is a separate DS frame building block the
 * host composes around it, per the ownership model Stephen
 * confirmed 2026-10-28 (the DS owns the design and the building
 * blocks; the app owns the content and composes).
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root (this
 * component imports react-native's FlatList; the root entry must
 * stay importable in plain Node).
 *
 * The composition mirrors RecipesPage — the sibling recipe
 * catalog — including its structural rules:
 * - #188: the FlatList is bounded to the fixed `list` shell with
 *   `flex: 1` (see listStyle), and the title + filter bar render
 *   as the list's header so they scroll with the recipes. The
 *   list stays mounted while loading; the spinner renders as the
 *   list's empty state.
 * - #96: the collapsed filter bar — search and a small "Filters"
 *   button initially; a filter's control renders only after it
 *   has been added from the chooser, and each added filter
 *   carries a Remove control that clears its values through the
 *   same change callbacks. Stephen's decision (2026-10-28): the
 *   public catalog uses the same collapsed chooser as RecipesPage
 *   rather than the retired web view's always-expanded bar, so
 *   the two catalogs behave the same. The filter prop contract is
 *   RecipesPage's, mirrored 1:1 — plain strings at the boundary,
 *   the app maps its own unions.
 * - #162: search uses the DS SearchField as-is; no lineHeight is
 *   set on any glyph or text in this file.
 *
 * Card navigation is a real link, not a press callback
 * (Stephen's navigation rule, 2026-10-28: a control that
 * navigates to another page is a link with an href; otherwise it
 * is a button with a callback). Each item carries the permalink
 * the host built (`/recipe/{id}/{slug}`) and renders through the
 * standalone DiscoveryCard widget (Stephen's decision,
 * 2026-10-28 — a reusable building block, not a row composed
 * privately here). There is deliberately no `onRecipePress`:
 * going callback-only would lose the href, and with it crawler
 * access to public recipes and open-in-new-tab / copy-link.
 *
 * Error state (Stephen's decision, 2026-10-28): the retired web
 * view had none — it never read the query's error, so a failed
 * fetch spun indefinitely or read as empty. The contract adds
 * `errorMessage` (the VerseSearchPage pattern: the app composes
 * the string, null when there is none), rendered as an error
 * alert in the list's empty state. Display-only — no retry
 * callback, matching VerseSearchPage.
 *
 * List states are mutually exclusive, all rendered by the list:
 * loading → spinner as the empty state (filter bar stays
 * mounted); error → the `errorMessage` alert as the empty state;
 * empty → EmptyState with `emptyMessage`; populated → the card
 * list, with a loading-more footer spinner while the next page
 * is in flight. Pagination rides the list's own end-reached
 * signal → `onLoadMore` (the retired view's host-owned
 * IntersectionObserver sentinel goes away).
 */

// List content geometry on the DS spacing scale, mirroring
// RecipesPage (plain object, no StyleSheet).
const listContentStyle = {
  paddingHorizontal: tokens.spacing[4],
  paddingBottom: tokens.spacing[8],
} as const;

// The FlatList must be bounded to the space the fixed `list`
// shell leaves it (#188): without flex: 1 it sizes to its full
// content height inside the non-scrolling shell, overflows the
// viewport, and never gets a scrollable viewport of its own.
const listStyle = { flex: 1 } as const;

/** One catalog row's view-model. The app formats `subtitle` (its
 * discovery meta line — "By {author} · {rating} · {satiety}",
 * with the author fallback applied app-side) and builds `href`
 * (the recipe's permalink); the view only renders them. Nothing
 * else is in the model: the card renders no description,
 * servings/times, tags, or nutrition, and the slug is needed only
 * to build the permalink, which stays app-side inside `href`. */
export type DiscoverPageItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  /** The recipe's permalink (`/recipe/{id}/{slug}`), built by
   * the host. The card renders as a real anchor to this URL on
   * web — see the header's navigation note. */
  href: string;
};

// The filter option sets the app's filter bar hardcodes, moved
// with the bar (the same sets RecipesPage carries). Values stay
// plain strings so no app type leaks into the DS: the app maps
// its own status/sort unions at the boundary.
const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All statuses" },
  { value: "idea", label: "Idea" },
  { value: "evolving", label: "Evolving" },
  { value: "perfected", label: "Perfected" },
  { value: "abandoned", label: "Abandoned" },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
  { value: "satiety", label: "Satiety" },
  { value: "calories", label: "Calories" },
];

const SORT_DIR_OPTIONS: SelectOption[] = [
  { value: "desc", label: "High to low" },
  { value: "asc", label: "Low to high" },
];

/** The addable filters of the collapsed filter bar (#96). The
 * calorie and satiety ranges each count as one filter (their
 * min/max fields add and remove together), as do the Sort by /
 * Order selects. */
export type DiscoverPageFilterId = "status" | "ingredient" | "calories" | "satiety" | "sort";

const FILTER_LABELS: Record<DiscoverPageFilterId, string> = {
  status: "Status",
  ingredient: "Ingredient",
  calories: "Calories",
  satiety: "Satiety",
  sort: "Sort",
};

const ALL_FILTER_IDS: DiscoverPageFilterId[] = [
  "status",
  "ingredient",
  "calories",
  "satiety",
  "sort",
];

export type DiscoverPageProps = {
  /** Page title copy — app-owned, like all copy on this page. */
  title: string;
  /** Search field placeholder copy ("Search public recipes…"
   * in the app today). */
  searchPlaceholder: string;
  /** Empty-state message, shown when the list is empty and not
   * loading and there is no error ("No public recipes match
   * your search." in the app today). */
  emptyMessage: string;
  /** The failed first load's message, composed by the app;
   * null renders no error state. */
  errorMessage: string | null;
  /** Recipes to render, already filtered/sorted by the app. */
  recipes: DiscoverPageItem[];
  /** First-load in flight: the list renders empty with a spinner
   * as its empty state, and the filter bar stays mounted. */
  isLoading: boolean;
  /** Next page in flight: a spinner renders as the list footer,
   * and the end-reached handler swallows duplicate requests
   * while it is set. It is the pagination guard's only fetch
   * signal: a host whose pages can return no new visible rows
   * (e.g. after client-side filtering) should pass it — without
   * it the list keeps plain fire-once-per-content-length
   * end-reached semantics and an empty page cannot re-arm the
   * signal on its own. */
  isFetchingNextPage?: boolean;
  /** Pagination hook, wired to the list's end-reached signal. */
  onLoadMore?: () => void;

  search: string;
  onSearchChange: (value: string) => void;
  /** Status filter. The control renders only when both the value
   * and its callback are provided and `showStatusFilter` is not
   * false — the same condition as RecipesPage's bar. (The public
   * host passes no status filter today; the contract mirrors
   * RecipesPage 1:1 so the two catalogs share one bar.) */
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  showStatusFilter?: boolean;
  ingredient: string;
  onIngredientChange: (value: string) => void;
  minCalories: string;
  onMinCaloriesChange: (value: string) => void;
  maxCalories: string;
  onMaxCaloriesChange: (value: string) => void;
  minSatiety: string;
  onMinSatietyChange: (value: string) => void;
  maxSatiety: string;
  onMaxSatietyChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  sortDir: string;
  onSortDirChange: (value: string) => void;
  /** Filters currently added to the bar (#96). Controlled: when
   * provided, the view renders exactly these filters' controls;
   * when omitted, the view tracks the added set internally,
   * seeded from the filters carrying non-default values. */
  activeFilters?: DiscoverPageFilterId[];
  /** Fires with the next added set whenever the user adds or
   * removes a filter, in controlled and uncontrolled use alike. */
  onActiveFiltersChange?: (filters: DiscoverPageFilterId[]) => void;
  /** Whether the add-filter chooser is open (#96). Controlled
   * like `activeFilters`; uncontrolled when omitted. */
  filterChooserOpen?: boolean;
  onFilterChooserOpenChange?: (open: boolean) => void;
};

type FilterControlsProps = Pick<
  DiscoverPageProps,
  | "searchPlaceholder"
  | "search"
  | "onSearchChange"
  | "statusFilter"
  | "onStatusFilterChange"
  | "showStatusFilter"
  | "ingredient"
  | "onIngredientChange"
  | "minCalories"
  | "onMinCaloriesChange"
  | "maxCalories"
  | "onMaxCaloriesChange"
  | "minSatiety"
  | "onMinSatietyChange"
  | "maxSatiety"
  | "onMaxSatietyChange"
  | "sort"
  | "onSortChange"
  | "sortDir"
  | "onSortDirChange"
  | "activeFilters"
  | "onActiveFiltersChange"
  | "filterChooserOpen"
  | "onFilterChooserOpenChange"
>;

function NumberFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <YStack flex={1}>
      <TextField
        label={label}
        accessibilityLabel={label}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
    </YStack>
  );
}

/** One added filter: its control(s) plus the Remove control that
 * clears and hides it (#96). */
function AddedFilter({
  id,
  onRemove,
  children,
}: {
  id: DiscoverPageFilterId;
  onRemove: (id: DiscoverPageFilterId) => void;
  children: ReactNode;
}) {
  return (
    <YStack gap={tokens.spacing[1]}>
      <XStack justifyContent="flex-end">
        <Button
          variant="ghost"
          size="sm"
          accessibilityLabel={`Remove ${FILTER_LABELS[id]} filter`}
          onPress={() => {
            onRemove(id);
          }}
        >
          Remove
        </Button>
      </XStack>
      {children}
    </YStack>
  );
}

/** The collapsed filter bar (#96), the same bar RecipesPage
 * renders: search and a small Filters button initially; the
 * button opens a chooser of the filters not yet added, and a
 * filter's control renders only once that filter has been
 * added. The only difference from RecipesPage's bar is the
 * search placeholder, which is a prop here because the two
 * catalogs' copy differs. */
function DiscoverFiltersBar({
  searchPlaceholder,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  ingredient,
  onIngredientChange,
  minCalories,
  onMinCaloriesChange,
  maxCalories,
  onMaxCaloriesChange,
  minSatiety,
  onMinSatietyChange,
  maxSatiety,
  onMaxSatietyChange,
  sort,
  onSortChange,
  sortDir,
  onSortDirChange,
  showStatusFilter = true,
  activeFilters,
  onActiveFiltersChange,
  filterChooserOpen,
  onFilterChooserOpenChange,
}: FilterControlsProps) {
  const statusAvailable =
    showStatusFilter && statusFilter !== undefined && onStatusFilterChange !== undefined;
  const available = ALL_FILTER_IDS.filter((id) => id !== "status" || statusAvailable);
  // Uncontrolled seed: a filter that already carries a non-default
  // value starts added, so existing callers that preset filter
  // values keep seeing (and can clear) those filters.
  const [internalActiveFilters, setInternalActiveFilters] = useState<DiscoverPageFilterId[]>(() => {
    const seeded: DiscoverPageFilterId[] = [];
    if (statusAvailable && statusFilter !== "all") seeded.push("status");
    if (ingredient !== "") seeded.push("ingredient");
    if (minCalories !== "" || maxCalories !== "") seeded.push("calories");
    if (minSatiety !== "" || maxSatiety !== "") seeded.push("satiety");
    if (sort !== "newest" || sortDir !== "desc") seeded.push("sort");
    return seeded;
  });
  const [internalChooserOpen, setInternalChooserOpen] = useState(false);
  const active = activeFilters ?? internalActiveFilters;
  const chooserOpen = filterChooserOpen ?? internalChooserOpen;
  const addable = available.filter((id) => !active.includes(id));

  const setActive = (next: DiscoverPageFilterId[]) => {
    if (activeFilters === undefined) setInternalActiveFilters(next);
    onActiveFiltersChange?.(next);
  };
  const setChooserOpen = (open: boolean) => {
    if (filterChooserOpen === undefined) setInternalChooserOpen(open);
    onFilterChooserOpenChange?.(open);
  };
  const addFilter = (id: DiscoverPageFilterId) => {
    setActive([...active, id]);
    setChooserOpen(false);
  };
  const removeFilter = (id: DiscoverPageFilterId) => {
    // Removal clears the filter's values through the ordinary
    // change callbacks, so a hidden filter never keeps filtering.
    if (id === "status") onStatusFilterChange?.("all");
    if (id === "ingredient") onIngredientChange("");
    if (id === "calories") {
      onMinCaloriesChange("");
      onMaxCaloriesChange("");
    }
    if (id === "satiety") {
      onMinSatietyChange("");
      onMaxSatietyChange("");
    }
    if (id === "sort") {
      onSortChange("newest");
      onSortDirChange("desc");
    }
    setActive(active.filter((filterId) => filterId !== id));
  };

  return (
    <YStack gap={tokens.spacing[3]}>
      {/* The row stretches its children (#188): the small Filters
          button's natural height is shorter than the SearchField,
          so the button stretches to the search field's height and
          the two line up. Do not switch this back to flex-start —
          that is what made the button shorter than the field. */}
      <XStack gap={tokens.spacing[2]} alignItems="stretch">
        <YStack flex={1}>
          <SearchField
            value={search}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </YStack>
        {addable.length > 0 ? (
          <Button
            variant="secondary"
            size="sm"
            accessibilityLabel="Add a filter"
            aria-expanded={chooserOpen}
            onPress={() => {
              setChooserOpen(!chooserOpen);
            }}
          >
            Filters
          </Button>
        ) : null}
      </XStack>
      {chooserOpen && addable.length > 0 ? (
        <XStack gap={tokens.spacing[2]} flexWrap="wrap">
          {addable.map((id) => (
            <Button
              key={id}
              variant="secondary"
              size="sm"
              accessibilityLabel={`Add ${FILTER_LABELS[id]} filter`}
              onPress={() => {
                addFilter(id);
              }}
            >
              {FILTER_LABELS[id]}
            </Button>
          ))}
        </XStack>
      ) : null}
      {active.includes("status") && statusAvailable ? (
        <AddedFilter id="status" onRemove={removeFilter}>
          <SelectField
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onValueChange={onStatusFilterChange}
          />
        </AddedFilter>
      ) : null}
      {active.includes("ingredient") ? (
        <AddedFilter id="ingredient" onRemove={removeFilter}>
          <TextField
            label="Ingredient"
            accessibilityLabel="Ingredient"
            value={ingredient}
            onChangeText={onIngredientChange}
            placeholder="e.g. chicken"
          />
        </AddedFilter>
      ) : null}
      {active.includes("calories") ? (
        <AddedFilter id="calories" onRemove={removeFilter}>
          <XStack gap={tokens.spacing[2]}>
            <NumberFilter label="Min cal" value={minCalories} onChange={onMinCaloriesChange} />
            <NumberFilter label="Max cal" value={maxCalories} onChange={onMaxCaloriesChange} />
          </XStack>
        </AddedFilter>
      ) : null}
      {active.includes("satiety") ? (
        <AddedFilter id="satiety" onRemove={removeFilter}>
          <XStack gap={tokens.spacing[2]}>
            <NumberFilter label="Min satiety" value={minSatiety} onChange={onMinSatietyChange} />
            <NumberFilter label="Max satiety" value={maxSatiety} onChange={onMaxSatietyChange} />
          </XStack>
        </AddedFilter>
      ) : null}
      {active.includes("sort") ? (
        <AddedFilter id="sort" onRemove={removeFilter}>
          <YStack gap={tokens.spacing[3]}>
            <SelectField
              label="Sort by"
              value={sort}
              options={SORT_OPTIONS}
              onValueChange={onSortChange}
            />
            <SelectField
              label="Order"
              value={sortDir}
              options={SORT_DIR_OPTIONS}
              onValueChange={onSortDirChange}
            />
          </YStack>
        </AddedFilter>
      ) : null}
    </YStack>
  );
}

/**
 * Full-page public recipe catalog view: the title, the collapsed
 * filter bar, and the DiscoveryCard list in the fixed `list`
 * shell. Controlled — see the file header for the contract and
 * the decisions it encodes.
 */
export function DiscoverPage(props: DiscoverPageProps) {
  const {
    title,
    emptyMessage,
    errorMessage,
    recipes,
    isLoading,
    isFetchingNextPage = false,
    onLoadMore,
  } = props;

  // End-reached handling, in two halves. The mount gate: while
  // the first load is in flight or the error state is showing,
  // the list's data range is empty and no page request may
  // start, so the callback is not mounted at all (a host that
  // passes no onLoadMore never paginates either). The fetch
  // guard: during a next-page fetch the callback STAYS mounted
  // and the handler swallows the request instead of unmounting.
  // Unmounting would break VirtualizedList's end-reached
  // bookkeeping — it fires once per content length (its
  // _sentEndForContentLength sentinel): the footer spinner's
  // mount grows the content length, and a mounted callback gets
  // that inflated length recorded even when the request is
  // swallowed, so when the fetch completes and the footer
  // unmounts, the restored length differs from the sentinel and
  // the next page is requested. Unmounted during the fetch, the
  // sentinel keeps the pre-footer length; an empty page (every
  // item filtered out client-side) restores exactly that
  // length, the fire is suppressed, and pagination stalls until
  // the user scrolls away and back. Neither half tests
  // recipes.length: an empty page with a live continuation
  // still paginates.
  const handleEndReached = () => {
    if (!isFetchingNextPage) {
      onLoadMore?.();
    }
  };

  return (
    <ScreenContainer variant="list" scrollable={false}>
      <FlatList
        style={listStyle}
        // The filter controls live inside this scroll view, so taps
        // on them must land while the keyboard is open instead of
        // being consumed to dismiss it.
        keyboardShouldPersistTaps="handled"
        data={isLoading ? [] : recipes}
        keyExtractor={(recipe) => recipe.id}
        contentContainerStyle={listContentStyle}
        // The title and filters render as the list's header so they
        // scroll together with the recipes (#188). The header sits
        // inside the list's content container, which already
        // supplies the horizontal padding. The list (and therefore
        // the header) stays mounted while loading — a filter edit
        // flips isLoading and a tree swap would unmount the focused
        // filter input mid-typing; the loading indicator renders as
        // the list's empty state instead.
        ListHeaderComponent={
          <YStack paddingBlockStart="$4" paddingBlockEnd="$2" gap="$4">
            <Text variant="heading">{title}</Text>
            <DiscoverFiltersBar {...props} />
          </YStack>
        }
        renderItem={({ item }) => (
          <DiscoveryCard
            title={item.title}
            {...(item.subtitle ? { subtitle: item.subtitle } : {})}
            imageUrl={item.imageUrl}
            href={item.href}
          />
        )}
        // Rows are separated by a spacer, not by margins on the
        // cards: the card is a standalone widget other surfaces
        // compose, and its spacing in a layout is the layout's to
        // own (the direction of #209 — gap/separation over margins
        // for inter-item spacing).
        ItemSeparatorComponent={() => <View height={tokens.spacing[3]} />}
        // Pagination: see handleEndReached above for why the
        // callback stays mounted (but guarded) during a next-page
        // fetch and is unmounted only for the first load, the
        // error state, or a host with no continuation.
        onEndReached={!isLoading && !errorMessage && onLoadMore ? handleEndReached : undefined}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? (
            <YStack marginBlockStart="$8" alignItems="center">
              <Spinner label="Loading" />
            </YStack>
          ) : errorMessage ? (
            <YStack marginBlockStart="$8">
              <Alert severity="error">{errorMessage}</Alert>
            </YStack>
          ) : (
            <EmptyState title={emptyMessage} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$4">
              <Spinner label="Loading" />
            </YStack>
          ) : undefined
        }
      />
    </ScreenContainer>
  );
}
