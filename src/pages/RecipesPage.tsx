import type { ReactNode } from "react";
import {
  CatalogFiltersBar,
  type CatalogFilterDefinition,
} from "../components/CatalogFiltersBar.js";
import { EmptyState } from "../components/EmptyState.js";
import { ListLoadingState } from "../components/ListLoadingState.js";
import { MediaRow } from "../components/MediaRow.js";
import { RatingStars } from "../components/RatingStars.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import type { SelectOption } from "../components/SelectField.js";
import { BoundedList } from "./BoundedList.js";
import { useCatalogPagination } from "./useCatalogPagination.js";

/**
 * RecipesPage (#49, pilot): Eciperay's Browse/Recipes screen as a
 * controlled @spudly/ui page component. The app keeps all state and
 * business logic — queries, filter state, mutations, navigation — and
 * drives this view entirely through props: filter values in, change
 * callbacks out, recipe view-models in, press callbacks out. Nothing
 * here imports an app package or fetches anything.
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root. This
 * component imports react-native's FlatList (through BoundedList);
 * the root entry must stay importable in plain Node (SSR, tooling,
 * this repo's own config tests), where react-native's Flow-typed
 * source cannot load. Apps opt into the subpath explicitly when they
 * rewire a screen onto a page component.
 *
 * The composition mirrors the app's RecipesListView (spudly/eciperay
 * packages/app) exactly, including its two layout regressions kept as
 * structural rules:
 * - #188: the list is the shared BoundedList (#119), bounded to the
 *   fixed `list` shell with `flex: 1` — its own styling, owned by
 *   BoundedList — and the filter bar renders as the list's header so
 *   it scrolls with the recipes instead of pinning above a sliver of
 *   list. The list — and therefore the focused filter input — stays
 *   mounted while loading; the spinner renders as the list's empty
 *   state (ListLoadingState). test/recipesPageBoundedList.test.mjs
 *   guards these patterns in source.
 * - #162: search uses the DS SearchField as-is. No lineHeight is set
 *   on any glyph or text in this file — the SearchField's own glyph
 *   box is the containment for that failure (see SearchField.tsx).
 *
 * Per-row accessory slot (`renderRecipeAccessory`): the one place
 * app-rendered content enters the list. The app's cook-log form
 * expands inline under the tapped card (its state and mutation live
 * in the app's RecipeListCard), so the stage-1 contract — a bare
 * `onLogCookPress(id)` callback with rows rendered end to end here —
 * left it nowhere to render. The slot keeps the boundary intact:
 * the view calls the render prop once per row with the row's id and
 * hands the result to the row (MediaRow's `accessory`), which
 * renders it directly under that row's card; returning
 * null/undefined renders nothing. When a row's accessory is
 * non-null, that row's log-cook control is hidden — the app
 * reproduces its card's control-hides-while-the-form-is-open
 * behavior purely by what it returns (the form for the open row,
 * null everywhere else). The form itself, its state, and its
 * mutation stay in the app; other rows' controls and the
 * `onLogCookPress` firing semantics are unchanged.
 *
 * Row actions: the row's only action is logging a cook, and the
 * control is the recipe's rating. A rated recipe renders its stars
 * (see `RecipesPageItem.rating`) and pressing them fires
 * `onLogCookPress`; an unrated recipe renders a single icon-only
 * button — one unfilled star, no text — firing the same callback.
 * Both states are the RatingStars component's pressable form. There
 * is deliberately no Delete in the list: deleting a recipe lives on
 * RecipeDetailPage (its `onDeletePress` chip).
 *
 * Placement is structural, not cosmetic (Stephen's direction,
 * 2026-10-24, after inspecting PR #120's final narrow baseline):
 * the control renders INLINE inside the text block — in the
 * subtitle's wrapping flow, immediately after the subtitle text —
 * and is never a flex item of the card row. As a trailing row item
 * it still competed with the text block for the row's width and
 * the narrow capture showed the same #205 failure (title wrapping
 * a character at a time while the stars held their width at the
 * row's right edge). Inside the text block the control can only
 * wrap within the block's own full width, below the subtitle it
 * follows; the row keeps exactly two flex children — thumbnail
 * and text block. MediaRow owns that geometry now (see its
 * `subtitleAction` slot).
 *
 * Collapsed filters (#96): the filter bar used to render every
 * filter control at once, and the form filled most of the
 * viewport. Now only the search field and a small "Filters"
 * button render initially. The button opens an add-filter
 * chooser; a filter's control renders only after it has been
 * added, and each added filter carries a Remove control that
 * clears its values (through the same change callbacks) and
 * hides it again. Which filters are added — and whether the
 * chooser is open — are controlled props (`activeFilters`,
 * `filterChooserOpen`, with matching change callbacks) so the
 * app can own the state per the #49 architecture; when the app
 * does not provide them, the view keeps them internally,
 * seeding the added set from any filter that already carries a
 * non-default value so a pre-filtered screen never hides its
 * own active filters.
 *
 * One list page, two screens (#185): this component is also
 * Eciperay's Shared-with-me screen — SharedWithMePage, the #49
 * sibling port, is consolidated into this page. The shared
 * configuration is a strict subset of this contract: the host
 * passes neither `onLogCookPress` nor `renderRecipeAccessory`,
 * so shared rows stay press-only (the #49 contract — in the app
 * the press opens the recipe's permalink externally), and it
 * passes its own empty-state copy through `emptyTitle` /
 * `emptyBody`, so neither screen's empty message changes. The
 * collapsed filter bar serves both screens; its uncontrolled
 * mode seeds the added set from non-default values, so the
 * shared host adopts it with no new state. Two deliberate
 * unifications ride along (accepted in the #185 decisions):
 * shared rows gain this page's "title, subtitle" accessible
 * label and the `flexBasis: 60` narrow-width row geometry
 * (#205) the shared page's rows lacked.
 *
 * #119: the page applies no styling of its own — it composes
 * design-system components and passes data and callbacks only.
 * The layout it used to hand-style lives in the components it
 * renders: BoundedList (the bounded list, its content inset,
 * the 12px row separation), ListLoadingState (the loading
 * states), CatalogFiltersBar (the shared catalog filter bar —
 * the page supplies its filter definitions as data; the bar
 * owns the control design), and MediaRow / RatingStars (the
 * row and its rating control). DiscoverPage renders the same
 * CatalogFiltersBar with its own definitions.
 */

/** One recipe row's view-model. The app formats `subtitle` (its list
 * meta line — servings · time · rating/satiety); the view only
 * renders it. */
export type RecipesPageItem = {
  id: string;
  /** The recipe's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * recipe id — in the shared-with-me configuration, the recipe's
   * permalink. Both of the row's targets (thumbnail and text
   * block) render as links carrying this href. */
  href: string;
  title: string;
  subtitle?: string;
  /** Display rating, 0–5, or null/absent when the recipe is
   * unrated. The app computes it by its display-rating rule (the
   * owner's star rating, else the community average); the view
   * renders it as the row's log-cook control — a rated recipe's
   * stars are the control, an unrated recipe gets an icon-only
   * button — and never formats it into the subtitle, so an app
   * that passes `rating` keeps the rating text out of `subtitle`. */
  rating?: number | null;
  imageUrl?: string | null;
};

// The filter option sets are this catalog's data, passed to the
// shared CatalogFiltersBar as filter definitions (the bar owns
// the control design; option sets and labels are the caller's
// data — the #311 ruling). Values stay plain strings so no app
// type leaks into the DS: the app maps its own status/sort
// unions at the boundary.
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
export type RecipesPageFilterId = "status" | "ingredient" | "calories" | "satiety" | "sort";

export type RecipesPageProps = {
  /** Recipes to render, already filtered/sorted by the app. */
  recipes: RecipesPageItem[];
  /** First-load in flight: the list renders empty with a spinner as
   * its empty state, and the filter bar stays mounted. */
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
  /** Optional row action, mirroring the app card's log-cook
   * affordance. "Log cook" is a callback only — the cook-log form
   * and its mutation stay in the app, which renders them (see
   * `renderRecipeAccessory`); the view owns the control: the
   * recipe's stars when it has a rating, a single icon-only button
   * when it does not. There is no delete callback — deleting a
   * recipe is a RecipeDetailPage action, not a list action. */
  onLogCookPress?: (recipeId: string) => void;
  /** Optional per-row accessory slot: called once per row with the
   * row's id; the returned node renders directly under that row's
   * card, inside the list item. Return null/undefined to render
   * nothing. When a row's accessory renders non-null content, that
   * row's log-cook control is hidden — the app returns its inline
   * cook-log form for the row whose form is open and null elsewhere,
   * which reproduces the app card's control-hides-while-open
   * behavior. */
  renderRecipeAccessory?: (recipeId: string) => ReactNode;
  /** Pagination hook, wired to the list's end-reached signal
   * through the shared catalog pagination pattern
   * (useCatalogPagination, #285 — the same pattern DiscoverPage
   * uses, so the two catalogs share one pagination contract). */
  onLoadMore?: () => void;
  /** Empty-state copy, per screen (#185): the title shown when
   * the list is empty and not loading. Defaults to the Recipes
   * screen's "No recipes found."; the Shared-with-me host passes
   * its own message so consolidation changes no visible copy. */
  emptyTitle?: string;
  /** Empty-state body shown under `emptyTitle`. The Recipes
   * screen has none; the Shared-with-me host passes its second
   * sentence here. */
  emptyBody?: string;

  search: string;
  onSearchChange: (value: string) => void;
  /** Status filter. The control renders only when both the value and
   * its callback are provided and `showStatusFilter` is not false —
   * the same condition as the app's filter bar. */
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
  activeFilters?: RecipesPageFilterId[];
  /** Fires with the next added set whenever the user adds or
   * removes a filter, in controlled and uncontrolled use alike. */
  onActiveFiltersChange?: (filters: RecipesPageFilterId[]) => void;
  /** Whether the add-filter chooser is open (#96). Controlled
   * like `activeFilters`; uncontrolled when omitted. */
  filterChooserOpen?: boolean;
  onFilterChooserOpenChange?: (open: boolean) => void;
};

/**
 * Full-page recipes-list view — the Recipes/Browse screen and,
 * since #185, the Shared-with-me screen: the filter bar and
 * recipe list in the fixed `list` shell. Controlled — see the
 * file header for the contract and the layout regressions its
 * structure guards.
 */
export function RecipesPage(props: RecipesPageProps) {
  const {
    recipes,
    isLoading,
    isFetchingNextPage = false,
    onLogCookPress,
    onLoadMore,
    renderRecipeAccessory,
    emptyTitle = "No recipes found.",
    emptyBody,
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
  // hook DiscoverPage uses. It gates the end-reached handler
  // during the first load, swallows duplicate requests while a
  // next-page fetch is in flight, and re-fires onLoadMore when
  // a fetch completes having added no new visible rows, so
  // consecutive no-new-rows pages paginate through without a
  // scroll-away. See useCatalogPagination for the full pattern.
  const { onEndReached, onScroll, onEndReachedThreshold } = useCatalogPagination({
    onLoadMore,
    isFetchingNextPage,
    itemCount: recipes.length,
    canPaginate: !isLoading,
  });

  // The catalog's filter definitions — this page's data in the
  // shared bar's control shapes (see the option sets above).
  // The status filter joins only when the host wires it (value
  // + callback provided, not hidden) — the same condition the
  // page's own bar carried before the #119 dedupe unified the
  // two catalogs' bars into CatalogFiltersBar.
  const catalogFilters: CatalogFilterDefinition<RecipesPageFilterId>[] = [];
  if (
    showStatusFilter !== false &&
    statusFilter !== undefined &&
    onStatusFilterChange !== undefined
  ) {
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
        separator="none"
        contentInset="page"
        // The filter controls live inside this scroll view, so taps on
        // them must land while the keyboard is open instead of being
        // consumed to dismiss it.
        keyboardShouldPersistTaps="handled"
        data={isLoading ? [] : recipes}
        keyExtractor={(recipe) => recipe.id}
        // The filters render as the list's header so they scroll
        // together with the recipes (#188). The header sits inside
        // the list's content container, which already supplies the
        // horizontal padding. The list (and therefore the header)
        // stays mounted while loading — a filter edit flips isLoading
        // and a tree swap would unmount the focused filter input
        // mid-typing; the loading indicator renders as the list's
        // empty state instead.
        ListHeaderComponent={
          <CatalogFiltersBar
            searchPlaceholder="Search recipes…"
            search={search}
            onSearchChange={onSearchChange}
            filters={catalogFilters}
            {...(activeFilters ? { activeFilters } : {})}
            {...(onActiveFiltersChange ? { onActiveFiltersChange } : {})}
            {...(filterChooserOpen !== undefined ? { filterChooserOpen } : {})}
            {...(onFilterChooserOpenChange ? { onFilterChooserOpenChange } : {})}
          />
        }
        renderItem={({ item }) => {
          const accessory = renderRecipeAccessory ? renderRecipeAccessory(item.id) : null;
          const hasAccessory = accessory !== null && accessory !== undefined;
          return (
            <MediaRow
              href={item.href}
              title={item.title}
              subtitle={item.subtitle}
              imageUrl={item.imageUrl}
              subtitleAction={
                onLogCookPress && !hasAccessory ? (
                  <RatingStars
                    rating={item.rating}
                    accessibilityLabel={
                      item.rating !== null && item.rating !== undefined && item.rating > 0
                        ? `Log a cook of ${item.title}, rated ${item.rating} out of 5 stars`
                        : `Log a cook of ${item.title}`
                    }
                    onPress={() => {
                      onLogCookPress(item.id);
                    }}
                  />
                ) : undefined
              }
              accessory={hasAccessory ? accessory : undefined}
            />
          );
        }}
        onEndReached={onEndReached}
        onScroll={onScroll}
        onEndReachedThreshold={onEndReachedThreshold}
        ListEmptyComponent={
          isLoading ? (
            <ListLoadingState label="Loading" />
          ) : (
            <EmptyState title={emptyTitle} {...(emptyBody ? { body: emptyBody } : {})} />
          )
        }
        ListFooterComponent={isFetchingNextPage ? <ListLoadingState label="Loading" /> : undefined}
      />
    </ScreenContainer>
  );
}
