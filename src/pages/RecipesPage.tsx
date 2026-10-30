import type { ReactNode } from "react";
import { Anchor, View, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Card } from "../components/Card.js";
import {
  CatalogFiltersBar,
  type CatalogFilterDefinition,
} from "../components/CatalogFiltersBar.js";
import { EmptyState } from "../components/EmptyState.js";
import { LinkOverlay } from "../components/linkOverlay.js";
import { ListLoadingState } from "../components/ListLoadingState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import type { SelectOption } from "../components/SelectField.js";
import { Text } from "../components/Text.js";
import { Thumbnail } from "../components/Thumbnail.js";
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
 * Both states are the page-local RatingStars composition's
 * pressable form (bottom of this file). There is deliberately no
 * Delete in the list: deleting a recipe lives on RecipeDetailPage
 * (its `onDeletePress` chip).
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
 * and text block. The page-local MediaRow composition owns
 * that geometry (see its `subtitleAction` slot).
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
 * #119: the page composes design-system components and passes
 * data and callbacks only. The layout it used to hand-style
 * lives in the components it renders: BoundedList (the bounded
 * list, its content inset, the 12px row separation),
 * ListLoadingState (the loading states), CatalogFiltersBar
 * (the shared catalog filter bar — the page supplies its filter
 * definitions as data; the bar owns the control design). The
 * row and its rating control are the page-local MediaRow /
 * RatingStars compositions at the bottom of this file, built
 * from the shared Card / Thumbnail / Text / LinkOverlay
 * components: a tranche page adds no library components
 * (Stephen's rule, 2026-10-29), so single-page compositions
 * live in the page. DiscoverPage renders the same
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

/**
 * Page-local compositions (Stephen's tranche rule, 2026-10-29):
 * a tranche page adds no library components, so the compositions
 * only this page uses live here, built from the shared
 * components — MediaRow (the list row) and RatingStars (its
 * log-cook control). If another page ever needs either, it
 * graduates to the library through a component-only PR; it is
 * never exported from this file.
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
 * The recipe list's media row: an elevated card holding a 64px
 * thumbnail (or the placeholder well), the title and optional
 * subtitle, and an optional accessory after the row. Composed
 * here in the page from the shared Card, Thumbnail, Text, and
 * LinkOverlay components (Stephen's tranche rule, 2026-10-29:
 * single-page compositions live in the page, not the library);
 * the row renderer supplies only domain content (href, title,
 * subtitle, image) and slots (subtitleAction, accessory).
 *
 * Both navigation targets are links carrying the row's href
 * (#248) and an accessible name built from the title: the media
 * target wraps only an image (or an empty placeholder), so
 * without the label a screen reader meets an unidentified link
 * for every row; the text target's label also carries the
 * subtitle when present. A subtitleAction is a third press
 * target nested in the text block's subtitle flow.
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
function MediaRow({ href, title, subtitle, imageUrl, subtitleAction, accessory }: MediaRowProps) {
  // The native rendering (`native` true) makes two adjustments
  // for the text frame's LinkOverlay: the visible texts are
  // decorative for accessibility (the overlay's composed label
  // is the row's one stop) and pointer-transparent, so native
  // hit testing falls through them to the overlay beneath,
  // while the subtitle action — which keeps the default pointer
  // events inside the box-none flow — still takes its own
  // presses.
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
  const textLabel = subtitle ? `${title}, ${subtitle}` : title;
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
