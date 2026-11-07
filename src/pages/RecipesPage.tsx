import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import type { ReactNode } from "react";
import { Anchor, View, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../widgets/accessibility.js";
import { Alert } from "../widgets/Alert.js";
import { Badge } from "../widgets/Badge.js";
import { Card } from "../widgets/Card.js";
import { CatalogFiltersBar, type CatalogFilterDefinition } from "../views/CatalogFiltersBar.js";
import { DiscoveryCard } from "../widgets/DiscoveryCard.js";
import { EmptyState } from "../widgets/EmptyState.js";
import { LinkOverlay } from "../widgets/linkOverlay.js";
import { Center } from "../widgets/Center.js";
import { Spinner } from "../widgets/Spinner.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionHeading } from "../widgets/SectionHeading.js";
import type { SelectOption } from "../widgets/SelectField.js";
import { Text } from "../widgets/Text.js";
import { Thumbnail } from "../widgets/Thumbnail.js";
import { BoundedList } from "./BoundedList.js";
import type { DiscoverPageItem } from "./DiscoverPage.js";
import { useCatalogPagination } from "./useCatalogPagination.js";

/**
 * RecipesPage (#49 pilot; unified in #415): Eciperay's single
 * "Recipes" browse page as a controlled @spudly/ui page
 * component. The app keeps all state and business logic —
 * queries, filter state, mutations, navigation — and drives
 * this view entirely through props: filter values in, change
 * callbacks out, recipe view-models in, press callbacks out.
 * Nothing here imports an app package or fetches anything.
 *
 * Placement: page components live in src/pages and are exported
 * from the package root (#298) — pages are the package's only
 * exports. This component imports react-native's FlatList
 * (through BoundedList), so the root entry is a react-native
 * entry like the apps' own builds; the old rule that the root
 * must stay importable in plain Node is superseded.
 *
 * Unified browse (#415, companion to eciperay #409): this page
 * REPLACES the pre-#415 RecipesPage contract (a major change).
 * One page renders, in order, on one scroll surface:
 * 1. The user's own material — recipes they created plus
 *    recipes shared with them — under the caller-supplied
 *    `ownTitle` heading, with preferred placement (first).
 * 2. Public discovery content under the caller-supplied
 *    `discoveryTitle` heading, rendered through the same
 *    DiscoveryCard DiscoverPage uses, each card a real link to
 *    the recipe's permalink.
 * The discovery section is host-optional (#512): a host with
 * no discovery feed for a surface omits the discovery props
 * entirely and the section — heading, loading, error, and
 * empty rows alike — does not render at all.
 * DiscoverPage stays in place untouched; its removal is a
 * follow-up once the app adopts this page.
 *
 * ONE search field and ONE filter set cover the unified
 * collection: the single CatalogFiltersBar in the list header
 * is the only search/filter UI on the page, and its filter-id
 * set is the one both predecessor pages already shared. The
 * page does no searching or filtering computation — the caller
 * supplies both sections' data already filtered by the one
 * search/filter state, plus the filter definitions' values and
 * change callbacks (the bar's data lives in this file, below).
 *
 * Section independence: each section carries its own loading /
 * error / empty state, rendered as rows of the one list. A
 * failed or empty discovery load never hides the user's own
 * recipes, and a failed or empty own load never hides discovery
 * content. When the user has no own/shared recipes, the own
 * section collapses to its empty state rather than disappearing,
 * so the layout stays stable (Stephen's plan ruling, #415).
 * Section titles and empty-state copy are caller-supplied.
 *
 * Shared-with-me (#185, reshaped by #415): shared recipes are
 * no longer a separate screen or a separate section — they
 * render inside the own section, in the caller's order, and a
 * shared item is distinguishable by its caller-supplied
 * `badgeLabel` (see RecipesPageItem), rendered as a badge on
 * the row and folded into the row's accessible name. Created
 * recipes simply omit the badge. The #185 shared configuration
 * (a second host driving this component with shared-only data
 * and its own empty copy) is retired with the old contract; a
 * host can still pass the shared screen's copy through
 * `ownEmptyTitle` / `ownEmptyBody`.
 *
 * The composition mirrors the app's RecipesListView (spudly/eciperay
 * packages/app), including its two layout regressions kept as
 * structural rules:
 * - #188: the list is the shared BoundedList (#119), bounded to
 *   the fixed `list` shell with `flex: 1` — its own styling,
 *   owned by BoundedList — and the filter bar renders as the
 *   list's header so it scrolls with the recipes instead of
 *   pinning above a sliver of list. The list — and therefore
 *   the focused filter input — stays mounted while either
 *   section loads; each section's spinner renders as that
 *   section's row in the list (a centered Spinner), never as a
 *   tree swap.
 * - #162: search uses the DS SearchField as-is. No lineHeight
 *   is set on any glyph or text in this file — the SearchField's
 *   own glyph box is the containment for that failure (see
 *   SearchField.tsx).
 *
 * Per-row accessory slot (`renderRecipeAccessory`): the one
 * place app-rendered content enters the list. The app's
 * cook-log form expands inline under the tapped own-section
 * card (its state and mutation live in the app's
 * RecipeListCard), so a bare `onLogCookPress(id)` callback with
 * rows rendered end to end here would leave it nowhere to
 * render. The slot keeps the boundary intact: the view calls
 * the render prop once per own-section row with the row's id
 * and hands the result to the row (MediaRow's `accessory`),
 * which renders it directly under that row's card; returning
 * null/undefined renders nothing. When a row's accessory is
 * non-null, that row's log-cook control is hidden — the app
 * reproduces its card's control-hides-while-the-form-is-open
 * behavior purely by what it returns (the form for the open
 * row, null everywhere else). The form itself, its state, and
 * its mutation stay in the app; other rows' controls and the
 * `onLogCookPress` firing semantics are unchanged. Discovery
 * rows are public content: they carry no accessory and no
 * log-cook control.
 *
 * Row actions: an own row's only action is logging a cook, and
 * the control is the recipe's rating. A rated recipe renders
 * its stars (see `RecipesPageItem.rating`) and pressing them
 * fires `onLogCookPress`; an unrated recipe renders a single
 * icon-only button — one unfilled star, no text — firing the
 * same callback. Both states are the page-local RatingStars
 * composition's pressable form (bottom of this file). There is
 * deliberately no Delete in the list: deleting a recipe lives
 * on RecipeDetailPage (its `onDeletePress` chip).
 *
 * Placement is structural, not cosmetic (Stephen's direction,
 * 2026-10-24, after inspecting PR #120's final narrow
 * baseline): the control renders INLINE inside the text block —
 * in the subtitle's wrapping flow, immediately after the
 * subtitle text — and is never a flex item of the card row. As
 * a trailing row item it still competed with the text block for
 * the row's width and the narrow capture showed the same #205
 * failure (title wrapping a character at a time while the stars
 * held their width at the row's right edge). Inside the text
 * block the control can only wrap within the block's own full
 * width, below the subtitle it follows; the row keeps exactly
 * two flex children — thumbnail and text block. The page-local
 * MediaRow composition owns that geometry (see its
 * `subtitleAction` slot).
 *
 * Collapsed filters (#96): the filter bar renders only the
 * search field and a small "Filters" button initially. The
 * button opens an add-filter chooser; a filter's control
 * renders only after it has been added, and each added filter
 * carries a Remove control that clears its values (through the
 * same change callbacks) and hides it again. Which filters are
 * added — and whether the chooser is open — are controlled
 * props (`activeFilters`, `filterChooserOpen`, with matching
 * change callbacks) so the app can own the state per the #49
 * architecture; when the app does not provide them, the view
 * keeps them internally, seeding the added set from any filter
 * that already carries a non-default value so a pre-filtered
 * screen never hides its own active filters.
 *
 * Pagination: `onLoadMore` is the DISCOVERY section's
 * continuation — the own section is the caller's complete
 * collection, so the list's end-reached signal can only mean
 * "more public recipes". It rides the shared catalog
 * pagination pattern (useCatalogPagination, #285), gated on
 * both sections' first loads and on the discovery error state.
 *
 * #119: the page composes design-system components and passes
 * data and callbacks only. The layout it used to hand-style
 * lives in the components it renders: BoundedList (the bounded
 * list, its content inset, the 12px row separation),
 * Center + Spinner (the loading states), CatalogFiltersBar
 * (the shared catalog filter bar — the page supplies its
 * filter definitions as data; the bar owns the control design),
 * SectionHeading (the section titles), DiscoveryCard (the
 * discovery rows). The own row and its rating control are the
 * page-local MediaRow / RatingStars compositions at the bottom
 * of this file, built from the shared Card / Thumbnail / Text /
 * LinkOverlay components: a tranche page adds no library
 * components (Stephen's rule, 2026-10-29), so single-page
 * compositions live in the page.
 */

/** One own-section recipe row's view-model. The app formats
 * `subtitle` (its list meta line — servings · time ·
 * rating/satiety); the view only renders it. Own-section items
 * are the user's created recipes and the recipes shared with
 * them, in the caller's order (preferred placement is the
 * section's, ordering inside it is the caller's). */
export type RecipesPageItem = {
  id: string;
  /** The recipe's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * recipe id — for a shared-with-me recipe, the recipe's
   * permalink. Both of the row's targets (thumbnail and text
   * block) render as links carrying this href. */
  href: string;
  title: string;
  subtitle?: string;
  /** Display rating, 0–5, or null/absent when the recipe is
   * unrated. The app computes it by its display-rating rule
   * (the owner's star rating, else the community average); the
   * view renders it as the row's log-cook control — a rated
   * recipe's stars are the control, an unrated recipe gets an
   * icon-only button — and never formats it into the subtitle,
   * so an app that passes `rating` keeps the rating text out
   * of `subtitle`. */
  rating?: number | null;
  imageUrl?: string | null;
  /** Caller-supplied marker distinguishing this item inside the
   * own section — the shared-with-me badge (#415): the host
   * passes its shared label (e.g. "Shared with you") for
   * recipes someone shared with the user and omits it for
   * recipes the user created. The view renders it as a badge
   * on the row and folds it into the row's accessible name; it
   * never invents the copy or decides which items earn it. */
  badgeLabel?: string;
};

/** One discovery-section recipe row's view-model: exactly
 * DiscoverPage's item (the public catalog's shape — the host
 * formats `subtitle` and builds the permalink `href`), reused
 * so the two pages' public rows cannot drift while both exist. */
export type RecipesPageDiscoveryItem = DiscoverPageItem;

// The filter option sets are this catalog's data, passed to the
// shared CatalogFiltersBar as filter definitions (the bar owns
// the control design; option sets and labels are the caller's
// data — the #311 ruling). Values stay plain strings so no app
// type leaks into the DS: the app maps its own status/sort
// unions at the boundary. The sets are the ones RecipesPage and
// DiscoverPage have always shared — the unified page keeps the
// one set both already used.
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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;

  /** The own section's title — caller-supplied copy (e.g. "Your
   * recipes"), rendered as the section's heading above its
   * rows. The section always renders, even when it holds no
   * recipes: it collapses to its empty state, never disappears
   * (#415). */
  ownTitle: string;
  /** The user's own recipes (created + shared-with-me, shared
   * items carrying `badgeLabel`), already filtered/sorted by
   * the app under the page's one search/filter state. */
  ownRecipes: RecipesPageItem[];
  /** Own section's first load in flight: the section renders
   * its spinner row; the discovery section is unaffected. */
  loadingOwn: boolean;
  /** The own section's failed-load message, composed by the
   * app; null/absent renders no error state. A failure here
   * never hides the discovery section. */
  ownErrorMessage?: string | null;
  /** Own section's empty-state title, shown when the section
   * is empty and not loading and has no error. Defaults to the
   * Recipes screen's "No recipes found.". */
  ownEmptyTitle?: string;
  /** Own section's empty-state body shown under
   * `ownEmptyTitle`. The Recipes screen has none; a host can
   * pass the shared-with-me screen's second sentence here
   * (#185's copy survives as caller data). */
  ownEmptyBody?: string;

  /** The discovery section's title — caller-supplied copy
   * (e.g. "Discover"), rendered as the section's heading above
   * its rows. Optional: the heading renders only when a title
   * is supplied. The whole discovery section is omitted when
   * `discoveryRecipes` is not supplied (#512). */
  discoveryTitle?: string;
  /** Public discovery recipes, already filtered/sorted by the
   * app under the same one search/filter state as the own
   * section. Optional (#512): when omitted, the discovery
   * section does not render at all — no heading, spinner,
   * error, or empty row — and discovery pagination stays
   * inert. */
  discoveryRecipes?: RecipesPageDiscoveryItem[];
  /** Discovery section's first load in flight: the section
   * renders its spinner row; the own section is unaffected.
   * Defaults to false when the section is supplied. */
  loadingDiscovery?: boolean;
  /** The discovery section's failed-load message, composed by
   * the app; null/absent renders no error state. A failure
   * here never hides the own section. */
  discoveryErrorMessage?: string | null;
  /** Discovery section's empty-state title, shown when the
   * section is empty and not loading and has no error.
   * Defaults to the public catalog's "No public recipes match
   * your search.". */
  discoveryEmptyTitle?: string;
  /** Discovery section's empty-state body shown under
   * `discoveryEmptyTitle`. */
  discoveryEmptyBody?: string;

  /** Discovery next page in flight: a spinner renders as the
   * list footer, and it is the shared pagination pattern's only
   * fetch signal (see useCatalogPagination, #285): while it is
   * set the end-reached handler swallows duplicate requests,
   * and when a fetch completes having added no new visible rows
   * the pattern re-fires `onLoadMore` so consecutive no-new-rows
   * pages cannot stall pagination. A host whose pages can
   * return no new visible rows (e.g. after client-side
   * filtering) should pass it — without it the list keeps plain
   * fire-once-per-content-length end-reached semantics and an
   * empty page cannot re-arm the signal on its own. */
  isFetchingNextPage?: boolean;
  /**
   * Own-section next page in flight (#438 Part 3): a loading
   * row renders after the own rows. The own section paginates
   * separately from discovery (its continuation is the host's
   * own query, not the shared catalog pattern), so it carries
   * its own fetch signal; hosts whose own section does not
   * paginate omit it. The host app screens used to compose
   * this row themselves from Alert / Spinner (the audit's
   * coverage rows for the browse screens).
   */
  isFetchingNextOwnPage?: boolean;
  /**
   * Own-section next-page failure (#438 Part 3): an error row
   * with a retry action renders after the own rows, in place
   * of the loading row. The first-page failure stays
   * `ownErrorMessage`; this is only the load-more failure.
   */
  ownLoadMoreErrorMessage?: string | null;
  /** The load-more error row's retry intent; the row renders only with the message. */
  onOwnLoadMoreRetry?: () => void;
  /** The retry action's label ("Try again"). */
  ownLoadMoreRetryLabel?: string;
  /** Optional own-row action, mirroring the app card's log-cook
   * affordance. "Log cook" is a callback only — the cook-log
   * form and its mutation stay in the app, which renders them
   * (see `renderRecipeAccessory`); the view owns the control:
   * the recipe's stars when it has a rating, a single icon-only
   * button when it does not. There is no delete callback —
   * deleting a recipe is a RecipeDetailPage action, not a list
   * action. Own-section rows only: discovery rows are links. */
  onLogCookPress?: (recipeId: string) => void;
  /** Optional per-row accessory slot for own-section rows:
   * called once per own row with the row's id; the returned
   * node renders directly under that row's card, inside the
   * list item. Return null/undefined to render nothing. When a
   * row's accessory renders non-null content, that row's
   * log-cook control is hidden — the app returns its inline
   * cook-log form for the row whose form is open and null
   * elsewhere, which reproduces the app card's
   * control-hides-while-open behavior. */
  renderRecipeAccessory?: (recipeId: string) => ReactNode;
  /** The discovery section's pagination hook, wired to the
   * list's end-reached signal through the shared catalog
   * pagination pattern (useCatalogPagination, #285 — the same
   * pattern DiscoverPage uses, so the catalogs share one
   * pagination contract). */
  onLoadMore?: () => void;

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
 * The unified list's row model: the one list renders both
 * sections as a single row sequence — each section's heading,
 * then either its state row (loading / error / empty) or its
 * recipe rows. Building the sequence explicitly is what keeps
 * the sections independent: a section's state replaces only
 * its own rows, never the other section's.
 */
type RecipesPageRow =
  | { kind: "ownHeading" }
  | { kind: "ownRecipe"; item: RecipesPageItem }
  | { kind: "loadingOwn" }
  | { kind: "ownError"; message: string }
  | { kind: "ownEmpty" }
  | { kind: "loadingOwnMore" }
  | { kind: "ownLoadMoreError"; message: string }
  | { kind: "discoveryHeading"; title: string }
  | { kind: "discoveryRecipe"; item: RecipesPageDiscoveryItem }
  | { kind: "loadingDiscovery" }
  | { kind: "discoveryError"; message: string }
  | { kind: "discoveryEmpty" };

function recipesPageRowKey(row: RecipesPageRow): string {
  switch (row.kind) {
    case "ownHeading":
      return "own-heading";
    case "ownRecipe":
      return `own-recipe-${row.item.id}`;
    case "loadingOwn":
      return "own-loading";
    case "ownError":
      return "own-error";
    case "ownEmpty":
      return "own-empty";
    case "loadingOwnMore":
      return "own-loading-more";
    case "ownLoadMoreError":
      return "own-load-more-error";
    case "discoveryHeading":
      return "discovery-heading";
    case "discoveryRecipe":
      return `discovery-recipe-${row.item.id}`;
    case "loadingDiscovery":
      return "discovery-loading";
    case "discoveryError":
      return "discovery-error";
    case "discoveryEmpty":
      return "discovery-empty";
  }
}

/**
 * Full-page unified Recipes browse view (#415): the one filter
 * bar, the own section (created + shared-with-me, preferred
 * placement), and the discovery section in the fixed `list`
 * shell, on one scroll surface. Controlled — see the file
 * header for the contract and the layout regressions its
 * structure guards.
 */
export function RecipesPage(props: RecipesPageProps) {
  const {
    ownTitle,
    ownRecipes,
    loadingOwn,
    ownErrorMessage = null,
    ownEmptyTitle = "No recipes found.",
    ownEmptyBody,
    discoveryTitle,
    discoveryRecipes,
    loadingDiscovery = false,
    discoveryErrorMessage = null,
    discoveryEmptyTitle = "No public recipes match your search.",
    discoveryEmptyBody,
    isFetchingNextPage = false,
    isFetchingNextOwnPage = false,
    ownLoadMoreErrorMessage = null,
    onOwnLoadMoreRetry,
    ownLoadMoreRetryLabel = "Try again",
    onLogCookPress,
    onLoadMore,
    renderRecipeAccessory,
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
  // hook DiscoverPage uses. The continuation is the discovery
  // section's, so the item count is the discovery count and
  // the mount gate covers both sections' first loads plus the
  // discovery error state: while any of those shows, the
  // list's end must not start a page request.
  // The discovery section is present only when the host
  // supplies its recipes (#512); when absent, pagination is
  // inert — item count 0 and canPaginate false — so the
  // end-reached handler can never fire a discovery request.
  const hasDiscovery = discoveryRecipes !== undefined;
  const { onEndReached, onScroll, onEndReachedThreshold } = useCatalogPagination({
    onLoadMore,
    isFetchingNextPage,
    itemCount: discoveryRecipes !== undefined ? discoveryRecipes.length : 0,
    canPaginate: hasDiscovery && !loadingOwn && !loadingDiscovery && !discoveryErrorMessage,
  });

  // The catalog's filter definitions — this page's data in the
  // shared bar's control shapes (see the option sets above).
  // The status filter joins only when the host wires it (value
  // + callback provided, not hidden) — the same condition the
  // predecessor pages' bars carried.
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

  // The unified row sequence: own section first (preferred
  // placement), then discovery. Each section contributes its
  // heading plus exactly one of — its loading row, its error
  // row, its empty row, or its recipe rows — so the sections'
  // states are independent by construction.
  const rows: RecipesPageRow[] = [{ kind: "ownHeading" }];
  if (loadingOwn) {
    rows.push({ kind: "loadingOwn" });
  } else if (ownErrorMessage) {
    rows.push({ kind: "ownError", message: ownErrorMessage });
  } else if (ownRecipes.length === 0) {
    rows.push({ kind: "ownEmpty" });
  } else {
    for (const item of ownRecipes) {
      rows.push({ kind: "ownRecipe", item });
    }
    // The own section's load-more state (#438 Part 3): the
    // failure row wins over the loading row, as a section's
    // error replaces its spinner in the sections above.
    if (ownLoadMoreErrorMessage) {
      rows.push({ kind: "ownLoadMoreError", message: ownLoadMoreErrorMessage });
    } else if (isFetchingNextOwnPage) {
      rows.push({ kind: "loadingOwnMore" });
    }
  }
  if (discoveryRecipes !== undefined) {
    if (discoveryTitle) {
      rows.push({ kind: "discoveryHeading", title: discoveryTitle });
    }
    if (loadingDiscovery) {
      rows.push({ kind: "loadingDiscovery" });
    } else if (discoveryErrorMessage) {
      rows.push({ kind: "discoveryError", message: discoveryErrorMessage });
    } else if (discoveryRecipes.length === 0) {
      rows.push({ kind: "discoveryEmpty" });
    } else {
      for (const item of discoveryRecipes) {
        rows.push({ kind: "discoveryRecipe", item });
      }
    }
  }

  return (
    <BigFooterShell footer={props.footer}>
      <ScreenContainer variant="list" scrollable={false}>
        <BoundedList
          separator="none"
          contentInset="page"
          // The filter controls live inside this scroll view, so taps on
          // them must land while the keyboard is open instead of being
          // consumed to dismiss it.
          keyboardShouldPersistTaps="handled"
          data={rows}
          keyExtractor={(row) => recipesPageRowKey(row)}
          // The filters render as the list's header so they scroll
          // together with the recipes (#188). The header sits inside
          // the list's content container, which already supplies the
          // horizontal padding. The list (and therefore the header)
          // stays mounted while either section loads — a filter edit
          // flips a section's loading flag and a tree swap would
          // unmount the focused filter input mid-typing; the loading
          // indicators render as the sections' own rows instead.
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
          renderItem={({ item: row }) => {
            switch (row.kind) {
              case "ownHeading":
                return (
                  <YStack paddingBlockEnd="$3">
                    <SectionHeading>{ownTitle}</SectionHeading>
                  </YStack>
                );
              case "ownRecipe": {
                const item = row.item;
                const accessory = renderRecipeAccessory ? renderRecipeAccessory(item.id) : null;
                const hasAccessory = accessory !== null && accessory !== undefined;
                return (
                  <MediaRow
                    href={item.href}
                    title={item.title}
                    subtitle={item.subtitle}
                    badgeLabel={item.badgeLabel}
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
              }
              case "loadingOwn":
                return (
                  <Center>
                    <Spinner label="Loading" />
                  </Center>
                );
              case "ownError":
                return <Alert severity="error">{row.message}</Alert>;
              case "ownEmpty":
                return (
                  <EmptyState
                    title={ownEmptyTitle}
                    {...(ownEmptyBody ? { body: ownEmptyBody } : {})}
                  />
                );
              case "loadingOwnMore":
                return (
                  <Center>
                    <Spinner label="Loading" />
                  </Center>
                );
              case "ownLoadMoreError":
                return (
                  <Alert
                    severity="error"
                    message={row.message}
                    {...(onOwnLoadMoreRetry
                      ? {
                          actions: [{ label: ownLoadMoreRetryLabel, onPress: onOwnLoadMoreRetry }],
                        }
                      : {})}
                  />
                );
              case "discoveryHeading":
                return (
                  <YStack paddingBlockEnd="$3">
                    <SectionHeading>{row.title}</SectionHeading>
                  </YStack>
                );
              case "discoveryRecipe": {
                const item = row.item;
                return (
                  <YStack paddingBlockEnd="$3">
                    <DiscoveryCard
                      title={item.title}
                      {...(item.subtitle ? { subtitle: item.subtitle } : {})}
                      imageUrl={item.imageUrl}
                      href={item.href}
                    />
                  </YStack>
                );
              }
              case "loadingDiscovery":
                return (
                  <Center>
                    <Spinner label="Loading" />
                  </Center>
                );
              case "discoveryError":
                return <Alert severity="error">{row.message}</Alert>;
              case "discoveryEmpty":
                return (
                  <EmptyState
                    title={discoveryEmptyTitle}
                    {...(discoveryEmptyBody ? { body: discoveryEmptyBody } : {})}
                  />
                );
            }
          }}
          onEndReached={onEndReached}
          onScroll={onScroll}
          onEndReachedThreshold={onEndReachedThreshold}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Center>
                <Spinner label="Loading" />
              </Center>
            ) : undefined
          }
        />
      </ScreenContainer>
    </BigFooterShell>
  );
}

/**
 * Page-local compositions (Stephen's tranche rule, 2026-10-29):
 * a tranche page adds no library components, so the compositions
 * only this page uses live here, built from the shared
 * components — MediaRow (the own-section list row) and
 * RatingStars (its log-cook control). If another page ever
 * needs either, it graduates to the library through a
 * component-only PR; it is never exported from this file.
 */

// Structural flex only: the card's text block expands and may shrink
// within the row (mirrors the app's ThumbnailListCard). The explicit
// flexBasis matters (eciperay #205): with a plain `flex: 1` the basis
// is 0, so on narrow viewports (e.g. a phone at the largest display
// size, ~314dp wide) the row's fixed child — the 64dp thumbnail —
// and any trailing row item consume the entire row and the text
// block collapses to ~0dp wide. Text measured at ~0 width paints
// nothing yet measures extremely tall, which stretched the card past
// the viewport with only the thumbnail visible. A 60dp basis gives
// the row a real line-breaking size, and the text block grows to
// fill its line. (A row action is not a row item at all — it renders
// inline inside this block; see subtitleAction.) At ordinary widths
// nothing changes — the basis is below the width the block already
// gets, so it still just expands.
const textBlockStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 60, minWidth: 0 } as const;

type MediaRowProps = {
  /** Row detail href. Both the media and the title/subtitle
   * text are links to it (two independent targets, per the
   * design system's link rules — cards are never pressable). */
  href: string;
  /** The row's title — the accessible name of the media link,
   * and the lead of the text link's composed name. */
  title: string;
  /** Optional secondary line under the title (counts, times,
   * attribution — the caller composes the string). It joins
   * the text link's accessible name ("Title, Subtitle"): a
   * title-only label would override the name React Native
   * derives from its Text children and drop the subtitle
   * announcement. */
  subtitle?: string | undefined;
  /** Optional caller-supplied marker (the item's `badgeLabel` —
   * the shared-with-me badge, #415): rendered as a Badge under
   * the subtitle line and folded into the text link's
   * accessible name after the subtitle, so the row announces
   * its marker ("Title, Subtitle, Shared with you") instead of
   * leaving it as unannounced decoration inside a link whose
   * label overrides its content. */
  badgeLabel?: string | undefined;
  /** Optional image URL; absent renders the placeholder well. */
  imageUrl?: string | null | undefined;
  /** Optional control rendered inline in the subtitle flow
   * (after the subtitle text, wrapping with it) — a row action
   * that reads as part of the subtitle line, e.g. a RatingStars
   * log-cook control. It renders inside the text link, so it
   * must cancel its press's default action (the RatingStars
   * contract) to keep the press from also navigating. */
  subtitleAction?: ReactNode;
  /** Optional accessory rendered after the row, inside the list
   * item — an expanded inline form belongs to the row it
   * belongs to. It renders in the same under-row padded wrapper
   * shape the card itself sits in. */
  accessory?: ReactNode;
};

/**
 * The own section's media row: an elevated card holding a 64px
 * thumbnail (or the placeholder well), the title and optional
 * subtitle, an optional caller-supplied badge under the
 * subtitle, and an optional accessory after the row. Composed
 * here in the page from the shared Card, Thumbnail, Text,
 * Badge, and LinkOverlay components (Stephen's tranche rule,
 * 2026-10-29: single-page compositions live in the page, not
 * the library); the row renderer supplies only domain content
 * (href, title, subtitle, badge, image) and slots
 * (subtitleAction, accessory).
 *
 * Both navigation targets are links carrying the row's href
 * (#248) and an accessible name built from the title: the media
 * target wraps only an image (or an empty placeholder), so
 * without the label a screen reader meets an unidentified link
 * for every row; the text target's label also carries the
 * subtitle and the badge when present. A subtitleAction is a
 * third press target nested in the text block's subtitle flow.
 *
 * On native the anchors are Texts and cannot carry these view
 * subtrees (the text block's texts would flow inline and the
 * thumbnail would be measured as text), so both targets
 * platform-split (see LinkOverlay): view-level frames carry the
 * content, and childless anchors stretched over the frames
 * carry the hrefs. The media frame's overlay renders last
 * (topmost, the standard layering); the text frame nests the
 * subtitle action, so its overlay renders underneath and the
 * frame's non-interactive content is pointer-transparent — the
 * action stays nested in the subtitle flow and keeps its own
 * presses.
 */
function MediaRow({
  href,
  title,
  subtitle,
  badgeLabel,
  imageUrl,
  subtitleAction,
  accessory,
}: MediaRowProps) {
  // The native rendering (`native` true) makes two adjustments
  // for the text frame's LinkOverlay: the visible texts are
  // decorative for accessibility (the overlay's composed label
  // is the row's one stop) and pointer-transparent, so native
  // hit testing falls through them to the overlay beneath,
  // while the subtitle action — which keeps the default pointer
  // events inside the box-none flow — still takes its own
  // presses. The badge is display-only, so its row is
  // pointer-transparent on native for the same reason.
  const renderTextContent = (native: boolean) => (
    <>
      <Text
        fontWeight={tokens.typography.fontWeight.semibold}
        accessible={native ? false : undefined}
        importantForAccessibility={native ? "no-hide-descendants" : undefined}
        pointerEvents={native ? "none" : undefined}
      >
        {title}
      </Text>
      {/* The subtitle line is a wrapping inline flow inside the
        text block: the subtitle text first, the subtitle action
        immediately after it (right after the subtitle's final
        segment). The action flows with the text — when the line
        is full it wraps onto the next line of the block, at the
        block's full width — instead of sitting in the card row
        as a third flex item whose fixed width starved this
        block (the #205 failure, seen again in PR #120's narrow
        captures). */}
      {subtitle || subtitleAction ? (
        <XStack
          flexWrap="wrap"
          alignItems="center"
          gap="$1"
          paddingTop="$1"
          pointerEvents={native ? "box-none" : undefined}
        >
          {subtitle ? (
            <Text
              variant="hint"
              accessible={native ? false : undefined}
              importantForAccessibility={native ? "no-hide-descendants" : undefined}
              pointerEvents={native ? "none" : undefined}
            >
              {subtitle}
            </Text>
          ) : null}
          {subtitleAction}
        </XStack>
      ) : null}
      {badgeLabel ? (
        <XStack
          paddingTop="$1"
          accessible={native ? false : undefined}
          importantForAccessibility={native ? "no-hide-descendants" : undefined}
          pointerEvents={native ? "none" : undefined}
        >
          <Badge tone="info">{badgeLabel}</Badge>
        </XStack>
      ) : null}
    </>
  );
  const textContent = renderTextContent(false);
  const media = imageUrl ? (
    <Thumbnail src={imageUrl} variant="row" />
  ) : (
    <View
      width="$16"
      height="$16"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.gray.gray2}
    />
  );
  const labelParts = [title];
  if (subtitle) labelParts.push(subtitle);
  if (badgeLabel) labelParts.push(badgeLabel);
  const textLabel = labelParts.join(", ");
  return (
    <>
      <YStack paddingBlockEnd="$3">
        <Card variant="elevated" flexDirection="row" flexWrap="wrap" alignItems="center" gap="$3">
          {isWeb ? (
            <Anchor
              href={href}
              textDecorationLine="none"
              display="web:flex"
              {...platformAccessibilityProps({
                accessibilityRole: "link",
                accessibilityLabel: title,
              })}
            >
              {media}
            </Anchor>
          ) : (
            <View position="relative">
              {media}
              <LinkOverlay href={href} accessibilityRole="link" accessibilityLabel={title} />
            </View>
          )}
          {isWeb ? (
            <Anchor
              href={href}
              textDecorationLine="none"
              display="web:flex"
              flexDirection="column"
              style={textBlockStyle}
              {...platformAccessibilityProps({
                accessibilityRole: "link",
                accessibilityLabel: textLabel,
              })}
            >
              {textContent}
            </Anchor>
          ) : (
            <YStack style={textBlockStyle} position="relative">
              <LinkOverlay href={href} accessibilityRole="link" accessibilityLabel={textLabel} />
              {renderTextContent(true)}
            </YStack>
          )}
        </Card>
      </YStack>
      {accessory ? <YStack paddingBlockEnd="$3">{accessory}</YStack> : null}
    </>
  );
}

const STAR_STEPS = [1, 2, 3, 4, 5] as const;

type RatingStarsBase = {
  /** Display rating, 0–5, or null/absent when unrated. The app
   * computes it by its display-rating rule; the composition
   * renders it and never formats it into text. */
  rating?: number | null | undefined;
};

type RatingStarsProps =
  | (RatingStarsBase & { onPress?: undefined; accessibilityLabel?: string | undefined })
  | (RatingStarsBase & { onPress: () => void; accessibilityLabel: string });

/**
 * A five-star display rating in the DS star language (the
 * StarRatingInput glyph treatment at reading size): ★ in
 * warning amber when filled, gray when not. The rating is a
 * display average as often as a personal star count, so the
 * stars fill by rounding to the nearest whole star. No
 * lineHeight is set on the glyphs (the #162 containment rule).
 *
 * With `onPress` the stars become the button for an action on
 * the rated item — a list row whose rating is its log-cook
 * control is the shape this serves. A rated item renders its
 * five stars as the button; an unrated item renders a single
 * unfilled star, no text — one glyph, same tone. The press
 * handler cancels the click's default action before firing:
 * the control typically renders inside a link (a row's text
 * target), and on web the platform press handling stops the
 * click's propagation but does not cancel its default, so
 * without the cancellation the wrapping anchor would also
 * navigate. On native the call is inert — the innermost press
 * target wins the responder. The button form requires its
 * accessible name in the type (the stars alone would announce
 * as a rating, not as the action they trigger), and it is
 * keyboard-operable on web: a focus stop with Enter/Space
 * activation (the CardRow pattern — a plain stack with onPress
 * is not a tab stop).
 */
function RatingStars(props: RatingStarsProps) {
  if (!props.onPress) {
    return <RatingStarRow rating={props.rating} />;
  }
  const { rating, onPress, accessibilityLabel } = props;
  const handlePress = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onPress();
  };
  const handleKeyDown = (event: { key: string; preventDefault: () => void; repeat?: boolean }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // A held key repeats keydown — activate once, not per repeat.
      if (!event.repeat) onPress();
    }
  };
  return (
    // Touch-target geometry for the pressable form: a ≥44dp
    // target centering its glyphs (the StarRatingInput
    // precedent).
    <YStack
      minWidth={44}
      minHeight={44}
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onPress={handlePress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...platformAccessibilityProps({
        accessibilityRole: "button",
        accessibilityLabel,
      })}
    >
      {rating !== null && rating !== undefined && rating > 0 ? (
        <RatingStarRow rating={rating} />
      ) : (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.gray.gray4 }}>
          ★
        </Text>
      )}
    </YStack>
  );
}

/** The five glyphs themselves, filled by the rounded rating. */
function RatingStarRow({ rating }: { rating?: number | null | undefined }) {
  const filled =
    rating !== null && rating !== undefined && rating > 0
      ? Math.min(5, Math.max(1, Math.round(rating)))
      : 0;
  return (
    <XStack gap={tokens.spacing[1]} alignItems="center">
      {STAR_STEPS.map((star) => (
        <Text
          key={star}
          style={{
            fontSize: tokens.typography.fontSize.lg,
            color: star <= filled ? tokens.colors.warning.warning6 : tokens.colors.gray.gray4,
          }}
        >
          ★
        </Text>
      ))}
    </XStack>
  );
}
