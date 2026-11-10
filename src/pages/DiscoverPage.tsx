import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { RecipesPage } from "./RecipesPage.js";

/**
 * DiscoverPage (#168; merged in #547): the public recipe
 * catalog is now ONE page component with RecipesPage — this
 * module keeps the public catalog's types and a thin
 * compatibility component that delegates to
 * `RecipesPage` with `variant="public"`, so existing hosts
 * importing DiscoverPage keep working while the catalog's
 * implementation, filter bar, pagination, and scroll model
 * live in exactly one place (#547, Option 2: public vs
 * signed-in behavior via props). New hosts should use
 * RecipesPage's public variant directly.
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

export type DiscoverPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
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
  loading: boolean;
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
 * The public catalog, delegated to the unified RecipesPage
 * (#547): public mode is RecipesPage's `variant="public"` with
 * exactly this module's prop contract.
 */
export function DiscoverPage(props: DiscoverPageProps) {
  const { footer, ...rest } = props;
  return (
    <BigFooterShell footer={footer} scrollMode="content">
      <RecipesPage variant="public" {...rest} />
    </BigFooterShell>
  );
}
