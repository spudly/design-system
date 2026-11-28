/* eslint-disable max-lines -- single cohesive page component (own list, discovery, and filter state in one definition); splitting it would scatter one page across files (#902 T4) */
import { Fragment, useEffect, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";

import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Alert } from "../../widgets/feedback/Alert.js";
import { isWeb } from "../../widgets/platform.js";
import {
  CatalogFiltersBar,
  type CatalogFilterDefinition,
  type CatalogPageFilterProps,
} from "../../views/eciperay/CatalogFiltersBar.js";
import { CatalogHeader } from "../../views/eciperay/CatalogHeader.js";
import { DiscoveryCard, type DiscoveryCardAction } from "../../widgets/content/DiscoveryCard.js";
import { EmptyState } from "../../views/shared/EmptyState.js";
import { Spacer } from "../../widgets/layout/Spacer.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { SectionHeading } from "../../widgets/content/SectionHeading.js";
import type { SelectOption } from "../../widgets/form/SelectField.js";
import { LoadingMediaRow } from "../../widgets/feedback/LoadingMediaRow.js";
import { ScrollSentinel } from "../../widgets/layout/ScrollSentinel.js";
import { Text } from "../../widgets/data/Text.js";
import { Thumbnail } from "../../widgets/data/Thumbnail.js";
import { RatingForm } from "../../widgets/form/RatingForm.js";
import { BoundedList } from "../shared/BoundedList.js";
import { RecipeRow, type RecipeRowItem } from "../shared/recipeRow.js";
import { useCatalogPagination } from "../shared/useCatalogPagination.js";
import { Col } from "../../widgets/layout/Col.js";

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
 * DiscoverPage was removed in #784 once the app adopted this
 * page — RecipesPage is the one and only browse page.
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
 *   section loads; each section's loading state renders as
 *   that section's rows in the list — skeleton rows, never as
 *   a tree swap (#278, tranche 4: the centered-Spinner pattern
 *   is deleted; a loading section renders exactly 3 dummy
 *   rows in its own row shape — MediaRow-shaped card bones for
 *   the own section, DiscoveryCards in their loading state
 *   for discovery and the public catalog — and a section's
 *   next-page fetch renders the same dummy rows where the
 *   incoming rows will land).
 * - #162: search uses the DS SearchField as-is. No lineHeight
 *   is set on any glyph or text in this file — the SearchField's
 *   own glyph box is the containment for that failure (see
 *   SearchField.tsx).
 *
 * Per-row cook-log form (`cookLogForm`, #687): the one
 * expanded panel in the list, rendered by the page itself.
 * The cook-log form expands inline under the tapped
 * own-section card, so a bare `onLogCookPress(id)` callback
 * with rows rendered end to end here would leave it nowhere
 * to render. The host instead names the open row and the
 * form's intents as data (`cookLogForm`), and the page
 * renders the DS RatingForm (the generalized cook-log form,
 * #176) as that row's accessory (MediaRow's `accessory`),
 * directly under the row's card. While a row's form is open,
 * that row's log-cook control is hidden — the
 * control-hides-while-the-form-is-open behavior the app card
 * had. The form's rating/notes state stays inside the form
 * and its mutation stays in the app; other rows' controls
 * and the `onLogCookPress` firing semantics are unchanged.
 * Discovery rows are public content: they carry no accessory
 * and no log-cook control.
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
 * Pagination (#559): each section paginates independently
 * through its OWN instance of the shared catalog pagination
 * pattern (useCatalogPagination, #285) — `onLoadMore` is the
 * DISCOVERY section's continuation and `onOwnLoadMore` is the
 * OWN section's. The list's end-reached signal (and the web
 * scroll sentinel) calls BOTH instances' handlers, and each
 * instance latches, guards, and re-arms on its own section's
 * state alone: the discovery instance gates on the discovery
 * first load and discovery error states only, the own
 * instance on the own first load and own error states only.
 * A discovery failure therefore never stalls own pagination,
 * and an own failure never stalls discovery pagination.
 *
 * #119: the page composes design-system components and passes
 * data and callbacks only. The layout it used to hand-style
 * lives in the components it renders: BoundedList (the bounded
 * list, its content inset, the 12px row separation),
 * the skeleton loading rows (the loading states, #278),
 * CatalogFiltersBar
 * (the shared catalog filter bar — the page supplies its
 * filter definitions as data; the bar owns the control design),
 * SectionHeading (the section titles), DiscoveryCard (the
 * discovery rows). The own row and its rating control are the
 * shared RecipeRow composition (recipeRow.tsx, #657), built
 * from the shared Card / Thumbnail / Text / LinkOverlay
 * components: a tranche page adds no library components
 * (Stephen's rule, 2026-10-29), so the row lives in an
 * internal page module, never the library.
 */

/** One own-section recipe row's view-model: the shared
 * recipe-row item (see recipeRow.tsx, #657) — aliased here so
 * the two pages' rows cannot drift. */
export type RecipesPageItem = RecipeRowItem;

/** One discovery-section recipe row's view-model (the public
 * catalog's shape — formerly DiscoverPage's item, owned here
 * since DiscoverPage's removal in #784). The app formats
 * `subtitle` (its discovery meta line — "By {author} · {rating}
 * · {satiety}", with the author fallback applied app-side) and
 * builds `href` (the recipe's permalink); the view only renders
 * them. Nothing else is in the model: the card renders no
 * description, servings/times, tags, or nutrition, and the slug
 * is needed only to build the permalink, which stays app-side
 * inside `href`. */
export type RecipesPageDiscoveryItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  /** The recipe's permalink (`/recipe/{id}/{slug}`), built by
   * the host. The card renders as a real anchor to this URL on
   * web — see the header's navigation note. */
  href: string;
  /** Per-card actions (#791): the host's per-recipe menu entries
   * (e.g. its hide / show-less actions) as plain data — labels
   * and callbacks are the host's; the card renders them in its
   * DS-owned overflow menu. Absent or empty renders no menu. */
  actions?: DiscoveryCardAction[];
};

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

/** The cook-log form's submit view-model (#687). */
export type RecipesPageCookLogFormValues = {
  rating: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
};

/** The open row's cook-log form (#687): the row it belongs to
 * plus the form's intents, as data. */
export type RecipesPageCookLogForm = {
  /** The own-section row the form is expanded under. */
  recipeId: string;
  onSubmit: (values: RecipesPageCookLogFormValues) => void;
  onSkip: () => void;
  isPending: boolean;
  /** Defaults to the voice object's ratingForm title (#539). */
  title?: string;
  /** Defaults to the voice object's ratingForm notesPlaceholder (#539). */
  notesPlaceholder?: string;
  /** Defaults to the voice object's ratingForm secondaryLabel (#539). */
  secondaryLabel?: string;
};

export type RecipesPageProps = CatalogPageFilterProps<RecipesPageFilterId> & {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /**
   * Photography-led lead image (#852): a host-supplied image URL
   * rendered as the hero `Thumbnail` above the catalog, following
   * RecipeDetailPage's pattern. It rides in the list header so it
   * scrolls with the catalog on native and renders above the
   * filters on web, in both variants. Absent or null, nothing
   * renders in the lead slot and the page stays text-led as
   * before — no placeholder art is baked into the design system
   * (Stephen's approved option 1 for #852).
   */
  leadImageUrl?: string | null;
  /** Accessible name for the lead image; absent, it is decorative. */
  leadImageAccessibilityLabel?: string;

  /**
   * Which catalog this page renders (#547, Option 2 — RecipesPage
   * and DiscoverPage merged into ONE page component):
   * "signed-in" (default) is the unified own + discovery browse;
   * "public" is the signed-out public catalog (the former
   * DiscoverPage contract, whose props follow below). Public vs
   * signed-in behavior is driven entirely by this prop and the
   * props each mode supplies.
   */
  variant?: "signed-in" | "public";
  /** Public mode: page title copy (the former DiscoverPage `title`). */
  title?: string;
  /** Public mode: search field placeholder copy. */
  searchPlaceholder?: string;
  /** Public mode: empty-state message. */
  emptyMessage?: string;
  /** Public mode: the failed first load's message; null/absent renders no error state. */
  errorMessage?: string | null;
  /** Public mode: the public recipes to render. */
  recipes?: RecipesPageDiscoveryItem[];
  /** Public mode: first-load in flight. */
  loading?: boolean;

  /** The own section's title — caller-supplied copy (e.g. "Your
   * recipes"), rendered as the section's heading above its
   * rows. The section always renders, even when it holds no
   * recipes: it collapses to its empty state, never disappears
   * (#415). */
  ownTitle?: string;
  /** The user's own recipes (created + shared-with-me, shared
   * items carrying `badgeLabel`), already filtered/sorted by
   * the app under the page's one search/filter state. */
  ownRecipes?: RecipesPageItem[];
  /** Own section's first load in flight: the section renders
   * skeleton rows (#278); the discovery section is unaffected. */
  loadingOwn?: boolean;
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
   * renders skeleton rows (#278); the own section is unaffected.
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

  /** Discovery next page in flight: skeleton rows render as
   * the list footer, and it is the shared pagination pattern's only
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
  /**
   * Own-section pagination continuation (#559): the own
   * section's next-page request, fired by the list's
   * end-reached signal through the own section's own instance
   * of the shared catalog pagination pattern (see
   * useCatalogPagination, #285) — gated on the own section's
   * first load and own error states only, never on the
   * discovery section's state, so own pagination keeps firing
   * while discovery is loading or in an error state. Hosts
   * whose own section does not paginate omit it, and the own
   * instance stays inert.
   */
  onOwnLoadMore?: () => void;
  /** Optional own-row action, mirroring the app card's log-cook
   * affordance. "Log cook" is a callback only — pressing it
   * opens the row's cook-log form, which the page renders from
   * the `cookLogForm` data prop (see below); the view owns the
   * control: the recipe's stars when it has a rating, a single
   * icon-only button when it does not. There is no delete
   * callback — deleting a recipe is a RecipeDetailPage action,
   * not a list action. Own-section rows only: discovery rows
   * are links. */
  onLogCookPress?: (recipeId: string) => void;
  /** The open row's cook-log form as data (#687): names the
   * own-section row whose form is expanded; the page renders
   * the DS RatingForm under that row's card, inside the list
   * item, and hides that row's log-cook control while it is
   * open. Omit it (or pass null) when no form is open. Only
   * the submit view-model, the skip intent, and the pending
   * flag cross the boundary — the mutation stays app-side. */
  cookLogForm?: RecipesPageCookLogForm | null;
  /** The discovery section's pagination hook, wired to the
   * list's end-reached signal through the shared catalog
   * pagination pattern (useCatalogPagination, #285 — the same
   * pattern DiscoverPage uses, so the catalogs share one
   * pagination contract). */
  onLoadMore?: () => void;
  /**
   * Discovery-section next-page failure (#559): an error row
   * with a retry action renders after the discovery rows, in
   * place of the discovery loading-more footer — the discovery
   * counterpart of `ownLoadMoreErrorMessage`. The first-page
   * failure stays `discoveryErrorMessage`; this is only the
   * load-more failure. While it is set, the discovery
   * pagination instance's gate is closed, so the end-reached
   * signal cannot re-fire the failed continuation silently —
   * the retry action is the way forward.
   */
  discoveryLoadMoreErrorMessage?: string | null;
  /** The discovery load-more error row's retry intent; the row renders only with the message. */
  onDiscoveryLoadMoreRetry?: () => void;
  /** The discovery retry action's label ("Try again"). */
  discoveryLoadMoreRetryLabel?: string;
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
  | { kind: "discoveryLoadMoreError"; message: string }
  | { kind: "loadingDiscovery" }
  | { kind: "discoveryError"; message: string }
  | { kind: "discoveryEmpty" };

function recipesPageRowKey(row: RecipesPageRow): string {
  switch (row.kind) {
    case "ownHeading": {
      return "own-heading";
    }
    case "ownRecipe": {
      return `own-recipe-${row.item.id}`;
    }
    case "loadingOwn": {
      return "own-loading";
    }
    case "ownError": {
      return "own-error";
    }
    case "ownEmpty": {
      return "own-empty";
    }
    case "loadingOwnMore": {
      return "own-loading-more";
    }
    case "ownLoadMoreError": {
      return "own-load-more-error";
    }
    case "discoveryHeading": {
      return "discovery-heading";
    }
    case "discoveryRecipe": {
      return `discovery-recipe-${row.item.id}`;
    }
    case "discoveryLoadMoreError": {
      return "discovery-load-more-error";
    }
    case "loadingDiscovery": {
      return "discovery-loading";
    }
    case "discoveryError": {
      return "discovery-error";
    }
    case "discoveryEmpty": {
      return "discovery-empty";
    }
  }
}

/**
 * Web scroll sentinel (#547): on web the catalogs render in
 * whole-page document flow with NO windowing, so pagination is
 * driven by this trailing sentinel instead of a FlatList's
 * end-reached signal. An IntersectionObserver on the sentinel
 * element fires the pagination handlers as the reader approaches
 * the bottom; where the sentinel's DOM node cannot be resolved
 * (non-DOM refs), a window scroll listener performs the same
 * near-bottom check as a fallback. Native never renders this —
 * native keeps its FlatList and its end-reached signal.
 *
 * Per-section availability and deduplication (#559): the
 * sentinel takes one section per paginating catalog section —
 * each section's own pagination handler (`onVisible`, undefined
 * while that section is gated) and its own fetching flag. All
 * tracking is PER SECTION: each section carries its own dedup
 * latch, availability is tracked per section, and fetching is
 * tracked per section. A single combined handler/flag would
 * stall pagination: if the sentinel became visible while BOTH
 * sections were gated, a combined fire would consume the shared
 * latch (both hooks swallow it), and when one section's gate
 * later opened, neither the combined availability nor the
 * combined fetching flag would change, so no recheck would
 * fire for that section. With per-section wiring, a section
 * that becomes available is rechecked on its own transition,
 * and a fetching change clears only that section's latch.
 *
 * Recheck (PR #556 review): the observer only calls back when
 * the sentinel's intersection CHANGES, so two stalls are
 * possible — the first callback arrives while pagination is
 * gated (no handler), or a fetch adds rows yet leaves the
 * sentinel inside the 400px margin. The sentinel therefore
 * tracks its own visibility and rechecks it whenever a section
 * becomes available (that section's handler goes from absent
 * to present) and whenever that section's fetch completes
 * (its `isFetchingNextPage` falls): if it is still within the
 * margin, it fires that section's handler again. The recheck
 * coordinates with the hook's no-new-rows re-arm through the
 * hook itself (useCatalogPagination's completion claim): a
 * recheck fire on the completion commit claims that
 * completion, the re-arm stands down, and the continuation is
 * requested exactly once.
 *
 * Deduplication (PR #556 review, round 2): every notification
 * path — the observer, the no-observer fallback's near-bottom
 * check, and the recheck — goes through each section's latched
 * fire: a visibility episode may request a section's
 * continuation only once, until the sentinel leaves the margin
 * or that section's fetch state changes. Without the latch the
 * fallback's mount-time check and the recheck effect's mount
 * run both fired before the host could commit
 * `isFetchingNextPage`, requesting the same continuation
 * twice — and a host that omits the fetching flag had no guard
 * against it at all. The latch never assumes that flag: a host
 * that omits it simply gets one request per visibility episode
 * per section.
 *
 * Mount-time visibility (#570): visibility before any real
 * scroll — the observer's first verdict on a short first page,
 * or the fallback's near-bottom computation from zero page
 * metrics in jsdom — is NOT a request: the sentinel fires only
 * once a window scroll has been observed. That scroll also
 * routes into each section's hook through `onScrollSignal`,
 * arming the hook's own initial-fire guard, so mount-time and
 * post-scroll visibility are distinguished at both layers and
 * the first page renders without an unprompted fetch.
 */
type WebScrollSentinelSection = {
  onVisible?: (() => void) | undefined;
  isFetchingNextPage?: boolean;
  /** Report a real window scroll to the section's pagination
   * hook, arming its initial-fire guard (#570). */
  onScrollSignal?: (() => void) | undefined;
};

function WebScrollSentinel({ sections }: { sections: WebScrollSentinelSection[] }) {
  const ref = useRef<{ nodeType?: number } | null>(null);
  const sectionsRef = useRef(sections);
  // Whether the sentinel is currently within the 400px margin
  // (the observer's last verdict, or the fallback's near-bottom
  // computation): the recheck below consults it, because no new
  // observer callback arrives while it simply stays true.
  const visibleRef = useRef(false);
  // Whether a real scroll has been observed (#570): visibility
  // at mount — before any scroll, with zero/unknown page
  // metrics — must not fire a section's continuation; only
  // post-scroll visibility may. A window scroll marks this,
  // routes the scroll signal into each section's hook guard,
  // and re-fires a sentinel that is already visible.
  const hasScrolledRef = useRef(false);
  // Whether this visibility episode has already requested each
  // section's continuation: one dedup latch per section (see
  // the header). Cleared for all sections when the sentinel
  // leaves the margin, and for a single section when that
  // section's fetch state changes, so each new episode — and
  // each completed fetch — may request once more.
  const requestedRefs = useRef<boolean[]>([]);
  // One section's latched fire: a no-op while that section has
  // no handler mounted (pagination gated — that absence must
  // NOT latch, or the recheck on that section becoming
  // available could not fire) and a no-op once this episode
  // has already requested that section's continuation.
  const fireSection = (index: number) => {
    const handler = sectionsRef.current[index]?.onVisible;
    if (!handler || requestedRefs.current[index]) return;
    requestedRefs.current[index] = true;
    handler();
  };
  const fireAllSections = () => {
    for (const [index, _] of sectionsRef.current.entries()) {
      fireSection(index);
    }
  };
  const clearAllLatches = () => {
    requestedRefs.current = sectionsRef.current.map(() => false);
  };
  const markScrolled = () => {
    hasScrolledRef.current = true;
    for (const section of sectionsRef.current) {
      section.onScrollSignal?.();
    }
  };
  useEffect(() => {
    sectionsRef.current = sections;
  });
  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;
    const node = ref.current as unknown as Element | null;
    if (node && typeof IntersectionObserver !== "undefined" && "nodeType" in node) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          visibleRef.current = visible;
          if (visible) {
            if (hasScrolledRef.current) {
              fireAllSections();
            }
          } else {
            clearAllLatches();
          }
        },
        { rootMargin: "400px" },
      );
      const onWindowScroll = () => {
        markScrolled();
        if (visibleRef.current) {
          fireAllSections();
        }
      };
      window.addEventListener("scroll", onWindowScroll, { passive: true });
      observer.observe(node);
      return () => {
        window.removeEventListener("scroll", onWindowScroll);
        observer.disconnect();
      };
    }
    if (typeof document === "undefined") return;
    const check = () => {
      const doc = document.documentElement;
      const nearBottom = doc.scrollHeight - window.innerHeight - window.scrollY <= 400;
      visibleRef.current = nearBottom;
      if (window.scrollY > 0) {
        markScrolled();
      }
      if (nearBottom) {
        if (hasScrolledRef.current) {
          fireAllSections();
        }
      } else {
        clearAllLatches();
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  // The recheck, per section: a section becoming available, or
  // that section's fetch state changing, can each leave a
  // visible sentinel with no pending observer callback — fire
  // that section's latched handler once per such TRANSITION.
  // The previous per-section values are tracked so the
  // effect's mount run is not itself a transition: at mount
  // the fallback check above has already fired for this
  // episode, and a second mount fire is exactly the duplicate
  // round 2 flagged. A section's fetch-state change clears
  // ONLY that section's latch first, so a completed fetch may
  // request its continuation even while the sentinel never
  // left the margin; an availability transition rechecks ONLY
  // the section that became available. Declared after the
  // sections-ref effect above, so it always calls the latest
  // handlers.
  const prevFetchingRefs = useRef<boolean[]>(
    sections.map((section) => section.isFetchingNextPage ?? false),
  );
  const prevAvailableRefs = useRef<boolean[]>(
    sections.map((section) => section.onVisible !== undefined),
  );
  useEffect(() => {
    for (const [index, section] of sections.entries()) {
      const fetching = section.isFetchingNextPage ?? false;
      const available = section.onVisible !== undefined;
      const fetchingChanged = prevFetchingRefs.current[index] !== fetching;
      const availableChanged = prevAvailableRefs.current[index] !== available;
      prevFetchingRefs.current[index] = fetching;
      prevAvailableRefs.current[index] = available;
      if (fetchingChanged) {
        requestedRefs.current[index] = false;
      }
      if ((fetchingChanged || availableChanged) && visibleRef.current && hasScrolledRef.current) {
        fireSection(index);
      }
    }
  });
  if (!isWeb) return null;
  return <ScrollSentinel sentinelRef={ref} />;
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
    leadImageUrl,
    leadImageAccessibilityLabel,
    variant = "signed-in",
    title: publicTitle,
    searchPlaceholder: publicSearchPlaceholder = "Search public recipes\u2026",
    emptyMessage: publicEmptyMessage = "",
    errorMessage: publicErrorMessage = null,
    recipes: publicRecipes,
    loading: publicLoading = false,
    ownTitle = "",
    ownRecipes = [],
    loadingOwn = false,
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
    onOwnLoadMore,
    onLogCookPress,
    onLoadMore,
    discoveryLoadMoreErrorMessage = null,
    onDiscoveryLoadMoreRetry,
    discoveryLoadMoreRetryLabel = "Try again",
    cookLogForm,
    search,
    onSearchChange,
    searchHelp,
    searchHint,
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
    filtersLoading,
  } = props;

  // Pagination: the shared catalog pattern (#285) — the same
  // hook DiscoverPage uses — run as TWO independent instances
  // (#559), one per section. The discovery instance's
  // continuation is the discovery section's, so its item count
  // is the discovery count and its mount gate covers the
  // discovery first load plus the discovery error states (the
  // first-page error and the load-more error): while any of
  // those shows, the list's end must not start a discovery
  // page request. The gate deliberately does NOT read the own
  // section's state — the sections page independently.
  // The discovery section is present only when the host
  // supplies its recipes (#512); when absent, pagination is
  // inert — item count 0 and canPaginate false — so the
  // end-reached handler can never fire a discovery request.
  const hasDiscovery = discoveryRecipes !== undefined;
  const {
    onEndReached,
    onScroll,
    onEndReachedThreshold,
    onLayout: discoveryLayout,
    onContentSizeChange: discoveryContentSizeChange,
    onScrollSignal: discoveryScrollSignal,
  } = useCatalogPagination({
    onLoadMore,
    isFetchingNextPage,
    itemCount: discoveryRecipes === undefined ? 0 : discoveryRecipes.length,
    canPaginate:
      hasDiscovery && !loadingDiscovery && !discoveryErrorMessage && !discoveryLoadMoreErrorMessage,
  });

  // The own section's pagination instance (#559): its own
  // continuation (`onOwnLoadMore`), its own fetch signal
  // (`isFetchingNextOwnPage`), and its own count and gate —
  // the own first load plus the own error states only. It
  // never reads the discovery section's state, so own
  // pagination keeps firing while discovery is loading or in
  // an error state (and vice versa).
  const ownPagination = useCatalogPagination({
    onLoadMore: onOwnLoadMore,
    isFetchingNextPage: isFetchingNextOwnPage,
    itemCount: ownRecipes.length,
    canPaginate: !loadingOwn && !ownErrorMessage && !ownLoadMoreErrorMessage,
  });

  // The list's end-reached and scroll signals fan out to BOTH
  // instances: each instance's handler applies its own gate,
  // fetch guard, and end latch, so a signal one section must
  // swallow never suppresses the other section's continuation.
  // Both instances share the default end-reached threshold, so
  // the discovery instance's threshold serves the list.
  const handleListEndReached = () => {
    onEndReached?.();
    ownPagination.onEndReached?.();
  };
  const handleListScroll = (event: Parameters<typeof onScroll>[0]) => {
    onScroll(event);
    ownPagination.onScroll(event);
  };
  // The list's layout signals fan out to both instances too
  // (#570): each instance's initial-fire guard reads its own
  // visible and content lengths from them.
  const handleListLayout = (event: LayoutChangeEvent) => {
    discoveryLayout(event);
    ownPagination.onLayout(event);
  };
  const handleListContentSizeChange = (width: number, height: number) => {
    discoveryContentSizeChange(width, height);
    ownPagination.onContentSizeChange(width, height);
  };

  // Public-mode pagination (#547): the same shared pattern,
  // gated on the public catalog's own first load and error
  // state. Inert in signed-in mode (canPaginate false there is
  // not used — the signed-in branch above owns that mode).
  const publicPagination = useCatalogPagination({
    onLoadMore,
    isFetchingNextPage,
    itemCount: publicRecipes === undefined ? 0 : publicRecipes.length,
    canPaginate: variant === "public" && !publicLoading && !publicErrorMessage,
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
      // The discovery section's load-more state (#559): the
      // failure row renders after the discovery rows and wins
      // over the loading-more footer (the footer spinner below
      // is suppressed while the error is set), exactly as
      // ownLoadMoreError wins over loadingOwnMore above.
      if (discoveryLoadMoreErrorMessage) {
        rows.push({ kind: "discoveryLoadMoreError", message: discoveryLoadMoreErrorMessage });
      }
    }
  }

  const renderRow = (row: RecipesPageRow) => {
    switch (row.kind) {
      case "ownHeading": {
        return (
          <Col>
            <SectionHeading>{ownTitle}</SectionHeading>
            <Spacer y="m" />
          </Col>
        );
      }
      case "ownRecipe": {
        const item = row.item;
        const accessory =
          cookLogForm && cookLogForm.recipeId === item.id ? (
            <RatingForm
              variant="light"
              onSubmit={cookLogForm.onSubmit}
              onSkip={cookLogForm.onSkip}
              isPending={cookLogForm.isPending}
              title={cookLogForm.title}
              notesPlaceholder={cookLogForm.notesPlaceholder}
              secondaryLabel={cookLogForm.secondaryLabel}
            />
          ) : null;
        return <RecipeRow item={item} onLogCookPress={onLogCookPress} accessory={accessory} />;
      }
      case "loadingOwn": {
        return <LoadingOwnRows />;
      }
      case "ownError": {
        return <Alert severity="error">{row.message}</Alert>;
      }
      case "ownEmpty": {
        return (
          <EmptyState title={ownEmptyTitle} {...(ownEmptyBody ? { body: ownEmptyBody } : {})} />
        );
      }
      case "loadingOwnMore": {
        return <LoadingOwnRows />;
      }
      case "ownLoadMoreError": {
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
      }
      case "discoveryHeading": {
        return (
          <Col>
            <SectionHeading>{row.title}</SectionHeading>
            <Spacer y="m" />
          </Col>
        );
      }
      case "discoveryRecipe": {
        const item = row.item;
        return (
          <Col>
            <DiscoveryCard
              title={item.title}
              {...(item.subtitle ? { subtitle: item.subtitle } : {})}
              imageUrl={item.imageUrl}
              href={item.href}
              {...(item.actions ? { actions: item.actions } : {})}
            />
            <Spacer y="m" />
          </Col>
        );
      }
      case "discoveryLoadMoreError": {
        return (
          <Alert
            severity="error"
            message={row.message}
            {...(onDiscoveryLoadMoreRetry
              ? {
                  actions: [
                    { label: discoveryLoadMoreRetryLabel, onPress: onDiscoveryLoadMoreRetry },
                  ],
                }
              : {})}
          />
        );
      }
      case "loadingDiscovery": {
        return <LoadingDiscoveryRows variant="section" />;
      }
      case "discoveryError": {
        return <Alert severity="error">{row.message}</Alert>;
      }
      case "discoveryEmpty": {
        return (
          <EmptyState
            title={discoveryEmptyTitle}
            {...(discoveryEmptyBody ? { body: discoveryEmptyBody } : {})}
          />
        );
      }
    }
  };

  const filtersBar = (
    <CatalogFiltersBar
      searchPlaceholder={variant === "public" ? publicSearchPlaceholder : "Search recipes\u2026"}
      search={search}
      onSearchChange={onSearchChange}
      {...(searchHelp ? { searchHelp } : {})}
      {...(searchHint ? { searchHint } : {})}
      filters={catalogFilters}
      {...(activeFilters ? { activeFilters } : {})}
      {...(onActiveFiltersChange ? { onActiveFiltersChange } : {})}
      {...(filterChooserOpen === undefined ? {} : { filterChooserOpen })}
      {...(onFilterChooserOpenChange ? { onFilterChooserOpenChange } : {})}
      {...(filtersLoading === undefined ? {} : { loading: filtersLoading })}
    />
  );

  // The signed-in catalog renders the bar bare (the public
  // variant wraps it in CatalogHeader, inside a gapped column):
  // the bar's Col carries a trailing Spacer for the $3 bottom
  // separation every list row carries under itself (the rows'
  // paddingBlockEnd rhythm), so the first section heading
  // sits the list's 12px below the search bar instead of flush
  // against it. (The Spacer is the sanctioned exception here:
  // the catalog rows own their separation individually —
  // MediaRow's paddingBlockEnd — so no parent gap can own
  // this one; #746.)
  // Both signed-in layouts (the web column and the native
  // list's header) render this one composition, so the
  // separation holds in the loaded and loading states alike.
  const filtersHeader = (
    <Col>
      {filtersBar}
      <Spacer y="m" />
    </Col>
  );

  // The photography-led lead (#852): the hero Thumbnail above
  // the catalog when the host supplies one, nothing when it does
  // not. The header form carries a trailing Spacer for the same
  // $3 bottom separation the filters header carries (the rows
  // own their separation individually, so no parent gap can own
  // this one; #746 — same sanctioned exception as filtersHeader).
  const leadImage = leadImageUrl ? (
    <Thumbnail
      variant="hero"
      src={leadImageUrl}
      {...(leadImageAccessibilityLabel ? { accessibilityLabel: leadImageAccessibilityLabel } : {})}
    />
  ) : null;
  const leadHeader = leadImage ? (
    <Col>
      {leadImage}
      <Spacer y="m" />
    </Col>
  ) : null;

  if (variant === "public") {
    const publicItems: RecipesPageDiscoveryItem[] = publicLoading ? [] : (publicRecipes ?? []);
    if (isWeb) {
      // Public catalog on web (#547): whole-page flow, no
      // windowing — cards render in document order and the
      // scroll sentinel drives pagination.
      return (
        <BigFooterShell footer={props.footer} scrollMode="content">
          <ScreenContainer variant="list">
            <Col gap="m" px="l">
              {leadImage}
              <CatalogHeader title={publicTitle ?? ""}>{filtersBar}</CatalogHeader>
              {publicLoading ? (
                <LoadingDiscoveryRows />
              ) : publicErrorMessage ? (
                <Alert severity="error">{publicErrorMessage}</Alert>
              ) : publicItems.length === 0 ? (
                <EmptyState title={publicEmptyMessage} />
              ) : (
                publicItems.map((item) => (
                  <DiscoveryCard
                    key={item.id}
                    title={item.title}
                    {...(item.subtitle ? { subtitle: item.subtitle } : {})}
                    imageUrl={item.imageUrl}
                    href={item.href}
                    {...(item.actions ? { actions: item.actions } : {})}
                  />
                ))
              )}
              {isFetchingNextPage ? <LoadingDiscoveryRows /> : null}
              <WebScrollSentinel
                sections={[
                  {
                    onVisible: publicPagination.onEndReached,
                    isFetchingNextPage,
                    onScrollSignal: publicPagination.onScrollSignal,
                  },
                ]}
              />
            </Col>
          </ScreenContainer>
        </BigFooterShell>
      );
    }
    // Public catalog on native: the BoundedList FlatList keeps
    // its windowing as the page's scroll owner — the shell is
    // in "content" mode, so no shell ScrollView wraps it.
    return (
      <BigFooterShell footer={props.footer} scrollMode="content">
        <ScreenContainer variant="list">
          <BoundedList
            separator="md"
            contentInset="page"
            keyboardShouldPersistTaps="handled"
            data={publicItems}
            keyExtractor={(recipe) => recipe.id}
            ListHeaderComponent={
              <>
                {leadHeader}
                <CatalogHeader title={publicTitle ?? ""}>{filtersBar}</CatalogHeader>
              </>
            }
            renderItem={({ item }) => (
              <DiscoveryCard
                title={item.title}
                {...(item.subtitle ? { subtitle: item.subtitle } : {})}
                imageUrl={item.imageUrl}
                href={item.href}
                {...(item.actions ? { actions: item.actions } : {})}
              />
            )}
            ListEmptyComponent={
              publicLoading ? (
                <LoadingDiscoveryRows />
              ) : publicErrorMessage ? (
                <Alert severity="error">{publicErrorMessage}</Alert>
              ) : (
                <EmptyState title={publicEmptyMessage} />
              )
            }
            ListFooterComponent={isFetchingNextPage ? <LoadingDiscoveryRows /> : undefined}
            onEndReached={publicPagination.onEndReached}
            onScroll={publicPagination.onScroll}
            onEndReachedThreshold={publicPagination.onEndReachedThreshold}
            onLayout={publicPagination.onLayout}
            onContentSizeChange={publicPagination.onContentSizeChange}
          />
        </ScreenContainer>
      </BigFooterShell>
    );
  }

  if (isWeb) {
    // Signed-in catalog on web (#547): whole-page flow, no
    // windowing — every row renders in document order inside
    // the page shell and the scroll sentinel drives BOTH
    // sections' pagination through per-section handlers (each
    // section's own guarded handler — the same handlers the
    // FlatList's end-reached signal fans out to on native, so
    // the shared pagination pattern is unchanged). Each
    // section carries its own fetch signal to the sentinel, so
    // a completed fetch or a gate opening in either section
    // rechecks that section alone (#559).
    return (
      <BigFooterShell footer={props.footer} scrollMode="content">
        <ScreenContainer variant="list">
          <Col px="l">
            {leadHeader}
            {filtersHeader}
            {rows.map((row) => (
              <Fragment key={recipesPageRowKey(row)}>{renderRow(row)}</Fragment>
            ))}
            {isFetchingNextPage && !discoveryLoadMoreErrorMessage ? <LoadingOwnRows /> : null}
            <WebScrollSentinel
              sections={[
                {
                  onVisible: onEndReached,
                  isFetchingNextPage,
                  onScrollSignal: discoveryScrollSignal,
                },
                {
                  onVisible: ownPagination.onEndReached,
                  isFetchingNextPage: isFetchingNextOwnPage,
                  onScrollSignal: ownPagination.onScrollSignal,
                },
              ]}
            />
          </Col>
        </ScreenContainer>
      </BigFooterShell>
    );
  }

  // Signed-in catalog on native: the BoundedList FlatList is
  // the scroll owner, exactly as in public mode — the shell's
  // "content" mode keeps it outside any shell ScrollView.
  return (
    <BigFooterShell footer={props.footer} scrollMode="content">
      <ScreenContainer variant="list">
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
            <>
              {leadHeader}
              {filtersHeader}
            </>
          }
          renderItem={({ item: row }) => renderRow(row)}
          onEndReached={handleListEndReached}
          onScroll={handleListScroll}
          onEndReachedThreshold={onEndReachedThreshold}
          onLayout={handleListLayout}
          onContentSizeChange={handleListContentSizeChange}
          ListFooterComponent={
            isFetchingNextPage && !discoveryLoadMoreErrorMessage ? <LoadingOwnRows /> : undefined
          }
        />
      </ScreenContainer>
    </BigFooterShell>
  );
}

/**
 * Loading-row compositions (Stephen's tranche rule, 2026-10-29):
 * the row itself (MediaRow + RatingStars) moved to the shared
 * internal recipeRow.tsx in #657 when HomePage became its
 * second consumer; the loading rows in its shape stay here.
 */

// The dummy skeleton rows for a loading section (#278,
// tranche 4): exactly 3 per section, from a frozen module-level
// constant — never generated per render (the
// CheckboxSelectList convention).
const LOADING_ROW_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

/**
 * A loading own section's rows: 3 dummy rows in the MediaRow
 * shape, rendered as LoadingMediaRows — the widget owns the
 * skeleton's shape (an elevated card holding a 64dp box bone
 * where the thumbnail sits and title/subtitle bones at the
 * row's text sizes, the region marked busy), no link and no
 * real content.
 */
function LoadingOwnRows() {
  return (
    <>
      {LOADING_ROW_KEYS.map((key) => (
        <LoadingMediaRow key={key} />
      ))}
    </>
  );
}

/**
 * A loading discovery/public section's rows: 3 DiscoveryCards
 * in their loading state (the widget's own skeleton — thumbnail
 * box and text bones in the card's geometry, no link). The
 * `section` variant is the unified list's form, where each card
 * sits in a Col with a trailing Spacer (its bottom separation);
 * the `standalone`
 * variant is the public catalog's own layouts, where the cards
 * render bare in the column's gap rhythm.
 */
function LoadingDiscoveryRows({ variant = "standalone" }: { variant?: "section" | "standalone" }) {
  return (
    <>
      {LOADING_ROW_KEYS.map((key) =>
        variant === "section" ? (
          <Col key={key}>
            <DiscoveryCard title="Recipe" subtitle="Recipe details" href="/loading" loading />
            <Spacer y="m" />
          </Col>
        ) : (
          <DiscoveryCard
            key={key}
            title="Recipe"
            subtitle="Recipe details"
            href="/loading"
            loading
          />
        ),
      )}
    </>
  );
}
