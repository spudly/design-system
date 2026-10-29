import { CatalogFiltersBar, type CatalogFilterDefinition } from "../components/CatalogFiltersBar.js";
import { CatalogHeader } from "../components/CatalogHeader.js";
import { DiscoveryCard } from "../components/DiscoveryCard.js";
import { EmptyState } from "../components/EmptyState.js";
import { ListErrorState } from "../components/ListErrorState.js";
import { ListLoadingFooter } from "../components/ListLoadingFooter.js";
import { ListLoadingState } from "../components/ListLoadingState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import type { SelectOption } from "../components/SelectField.js";
import { BoundedList } from "./BoundedList.js";
import { useCatalogPagination } from "./useCatalogPagination.js";

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
 * `@spudly/ui/pages` subpath export, not the package root (the
 * pages' lists ride react-native's FlatList, via BoundedList;
 * the root entry must stay importable in plain Node).
 *
 * The composition mirrors RecipesPage — the sibling recipe
 * catalog — including its structural rules:
 * - #188: the list is bounded to the fixed `list` shell
 *   (BoundedList owns the bounding and the list geometry — the
 *   flex, the content insets, the row separation), and the
 *   title + filter bar render as the list's header so they
 *   scroll with the recipes. The list stays mounted while
 *   loading; the spinner renders as the list's empty state.
 * - #96: the collapsed filter bar — search and a small "Filters"
 *   button initially; a filter's control renders only after it
 *   has been added from the chooser, and each added filter
 *   carries a Remove control that clears its values through the
 *   same change callbacks. Stephen's decision (2026-10-28): the
 *   public catalog uses the same collapsed chooser as RecipesPage
 *   rather than the retired web view's always-expanded bar, so
 *   the two catalogs behave the same. The bar is the shared
 *   CatalogFiltersBar component; the filter prop contract is
 *   RecipesPage's, mirrored 1:1 — plain strings at the boundary,
 *   the app maps its own unions. The bar is definition-driven
 *   (Stephen's ruling on PR #311): which filters exist, their
 *   labels, option sets, and defaults are THIS page's data,
 *   passed in as filter definitions — the bar owns only the
 *   control design.
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
 *
 * The page composes components and passes data and callbacks
 * only (#119): the list geometry lives in BoundedList, the
 * header in CatalogHeader, the bar in CatalogFiltersBar, and the
 * list states in the shared List*State components.
 */

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

/** The addable filters of the collapsed filter bar (#96). The
 * calorie and satiety ranges each count as one filter (their
 * min/max fields add and remove together), as do the Sort by /
 * Order selects. */
export type DiscoverPageFilterId = "status" | "ingredient" | "calories" | "satiety" | "sort";

// The catalog's filter option sets — this page's DATA, passed
// into CatalogFiltersBar as filter definitions (the bar owns
// the control design, not the data — Stephen's ruling on PR
// #311). Values stay plain strings so no app type leaks into
// the DS: the app maps its own status/sort unions at the
// boundary.
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
   * and it is the shared pagination pattern's only fetch signal
   * (see useCatalogPagination, #285): while it is set the
   * end-reached handler swallows duplicate requests, and when a
   * fetch completes having added no new visible rows the
   * pattern re-fires `onLoadMore` so consecutive no-new-rows
   * pages cannot stall pagination. A host whose pages can
   * return no new visible rows (e.g. after client-side
   * filtering) should pass it — without it the list keeps plain
   * fire-once-per-content-length end-reached semantics and an
   * empty page cannot re-arm the signal on its own. */
  isFetchingNextPage?: boolean;
  /** Pagination hook, wired to the list's end-reached signal
   * through the shared catalog pagination pattern
   * (useCatalogPagination, #285 — the same pattern RecipesPage
   * uses, so the two catalogs share one pagination contract). */
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

/**
 * Full-page public recipe catalog view: the title, the collapsed
 * filter bar, and the DiscoveryCard list in the fixed `list`
 * shell. Controlled — see the file header for the contract and
 * the decisions it encodes.
 */
export function DiscoverPage(props: DiscoverPageProps) {
  const {
    title,
    searchPlaceholder,
    emptyMessage,
    errorMessage,
    recipes,
    isLoading,
    isFetchingNextPage = false,
    onLoadMore,
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    showStatusFilter,
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
    activeFilters,
    onActiveFiltersChange,
    filterChooserOpen,
    onFilterChooserOpenChange,
  } = props;

  // Pagination: the shared catalog pattern (#285) — the same
  // hook RecipesPage uses. It gates the end-reached handler
  // during the first load and the error state, swallows
  // duplicate requests while a next-page fetch is in flight,
  // and re-fires onLoadMore when a fetch completes having
  // added no new visible rows, so consecutive no-new-rows
  // pages paginate through without a scroll-away. See
  // useCatalogPagination for the full pattern.
  const { onEndReached, onScroll, onEndReachedThreshold } = useCatalogPagination({
    onLoadMore,
    isFetchingNextPage,
    itemCount: recipes.length,
    canPaginate: !isLoading && !errorMessage,
  });

  // The catalog's filter definitions — the page's data in the
  // bar's control shapes (see the option sets above). The status
  // filter joins only when the host wires it (value + callback
  // provided, not hidden), the same condition RecipesPage's bar
  // carries; the public host passes no status filter today.
  const catalogFilters: CatalogFilterDefinition<DiscoverPageFilterId>[] = [];
  if (showStatusFilter !== false && statusFilter !== undefined && onStatusFilterChange !== undefined) {
    catalogFilters.push({
      kind: "select",
      id: "status",
      label: "Status",
      options: STATUS_OPTIONS,
      value: statusFilter,
      onChange: onStatusFilterChange,
      defaultValue: "all",
    });
  }
  catalogFilters.push(
    {
      kind: "text",
      id: "ingredient",
      label: "Ingredient",
      value: ingredient,
      onChange: onIngredientChange,
      placeholder: "e.g. chicken",
      defaultValue: "",
    },
    {
      kind: "range",
      id: "calories",
      label: "Calories",
      minLabel: "Min cal",
      maxLabel: "Max cal",
      minValue: minCalories,
      maxValue: maxCalories,
      onMinChange: onMinCaloriesChange,
      onMaxChange: onMaxCaloriesChange,
    },
    {
      kind: "range",
      id: "satiety",
      label: "Satiety",
      minLabel: "Min satiety",
      maxLabel: "Max satiety",
      minValue: minSatiety,
      maxValue: maxSatiety,
      onMinChange: onMinSatietyChange,
      onMaxChange: onMaxSatietyChange,
    },
    {
      kind: "sort",
      id: "sort",
      label: "Sort",
      sortLabel: "Sort by",
      sortOptions: SORT_OPTIONS,
      sortValue: sort,
      onSortChange,
      defaultSortValue: "newest",
      dirLabel: "Order",
      dirOptions: SORT_DIR_OPTIONS,
      dirValue: sortDir,
      onDirChange: onSortDirChange,
      defaultDirValue: "desc",
    },
  );

  return (
    <ScreenContainer variant="list" scrollable={false}>
      <BoundedList
        // Rows are separated by the list's own spacer, not by
        // margins on the cards: the card is a standalone widget
        // other surfaces compose, and its spacing in a layout is
        // the layout's to own (the direction of #209).
        separator="md"
        contentInset="page"
        // The filter controls live inside this scroll view, so taps
        // on them must land while the keyboard is open instead of
        // being consumed to dismiss it.
        keyboardShouldPersistTaps="handled"
        data={isLoading ? [] : recipes}
        keyExtractor={(recipe) => recipe.id}
        // The title and filters render as the list's header so they
        // scroll together with the recipes (#188). The header sits
        // inside the list's content container, which already
        // supplies the horizontal padding. The list (and therefore
        // the header) stays mounted while loading — a filter edit
        // flips isLoading and a tree swap would unmount the focused
        // filter input mid-typing; the loading indicator renders as
        // the list's empty state instead.
        ListHeaderComponent={
          <CatalogHeader title={title}>
            <CatalogFiltersBar
              searchPlaceholder={searchPlaceholder}
              search={search}
              onSearchChange={onSearchChange}
              filters={catalogFilters}
              {...(activeFilters ? { activeFilters } : {})}
              {...(onActiveFiltersChange ? { onActiveFiltersChange } : {})}
              {...(filterChooserOpen !== undefined ? { filterChooserOpen } : {})}
              {...(onFilterChooserOpenChange ? { onFilterChooserOpenChange } : {})}
            />
          </CatalogHeader>
        }
        renderItem={({ item }) => (
          <DiscoveryCard
            title={item.title}
            {...(item.subtitle ? { subtitle: item.subtitle } : {})}
            imageUrl={item.imageUrl}
            href={item.href}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ListLoadingState label="Loading" />
          ) : errorMessage ? (
            <ListErrorState message={errorMessage} />
          ) : (
            <EmptyState title={emptyMessage} />
          )
        }
        ListFooterComponent={isFetchingNextPage ? <ListLoadingFooter label="Loading" /> : undefined}
        // Pagination: the shared catalog pattern's handler —
        // see useCatalogPagination above. It stays mounted (but
        // guarded) during a next-page fetch and is unmounted
        // only for the first load, the error state, or a host
        // with no continuation.
        onEndReached={onEndReached}
        onScroll={onScroll}
        onEndReachedThreshold={onEndReachedThreshold}
      />
    </ScreenContainer>
  );
}
