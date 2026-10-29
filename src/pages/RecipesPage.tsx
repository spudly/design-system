import { useState, type ReactNode } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Anchor, Image, View, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { EmptyState } from "../components/EmptyState.js";
import { LinkOverlay } from "../components/linkOverlay.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SearchField } from "../components/SearchField.js";
import { SelectField, type SelectOption } from "../components/SelectField.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
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
 * component imports react-native's FlatList; the root entry must
 * stay importable in plain Node (SSR, tooling, this repo's own
 * config tests), where react-native's Flow-typed source cannot
 * load. Apps opt into the subpath explicitly when they rewire a
 * screen onto a page component.
 *
 * The composition mirrors the app's RecipesListView (spudly/eciperay
 * packages/app) exactly, including its two layout regressions kept as
 * structural rules:
 * - #188: the FlatList is bounded to the fixed `list` shell with
 *   `flex: 1` (see listStyle), and the filter bar renders as the
 *   list's header so it scrolls with the recipes instead of pinning
 *   above a sliver of list. The list — and therefore the focused
 *   filter input — stays mounted while loading; the spinner renders
 *   as the list's empty state. test/recipesPageBoundedList.test.mjs
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
 * renders whatever comes back directly under that row's card;
 * returning null/undefined renders nothing. When a row's accessory
 * is non-null, that row's log-cook control is hidden — the app
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
 * There is deliberately no Delete in the list: deleting a recipe
 * lives on RecipeDetailPage (its `onDeletePress` chip).
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
 * and text block.
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
 */

// List content geometry on the DS spacing scale, mirroring the app
// screen (plain object, no StyleSheet).
const listContentStyle = {
  paddingHorizontal: tokens.spacing[4],
  paddingBottom: tokens.spacing[8],
} as const;

// The FlatList must be bounded to the space the fixed `list` shell
// leaves it (#188): without flex: 1 it sizes to its full content
// height inside the non-scrolling shell, overflows the viewport, and
// never gets a scrollable viewport of its own.
const listStyle = { flex: 1 } as const;

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
// fill its line. (The log-cook control is no longer a row item at
// all — it renders inline inside this block; see the header's row
// actions note.) At ordinary widths nothing changes — the basis is
// below the width the block already gets, so it still just expands.
const textBlockStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 60, minWidth: 0 } as const;

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

// The filter option sets the app's filter bar hardcodes, moved with
// the bar. Values stay plain strings so no app type leaks into the
// DS: the app maps its own status/sort unions at the boundary.
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

const FILTER_LABELS: Record<RecipesPageFilterId, string> = {
  status: "Status",
  ingredient: "Ingredient",
  calories: "Calories",
  satiety: "Satiety",
  sort: "Sort",
};

const ALL_FILTER_IDS: RecipesPageFilterId[] = [
  "status",
  "ingredient",
  "calories",
  "satiety",
  "sort",
];

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

type FilterControlsProps = Pick<
  RecipesPageProps,
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
  id: RecipesPageFilterId;
  onRemove: (id: RecipesPageFilterId) => void;
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

/** The collapsed filter bar (#96): search and a small Filters
 * button initially; the button opens a chooser of the filters not
 * yet added, and a filter's control — the same controls the bar
 * always rendered: the status select, ingredient, min/max calorie
 * and satiety number fields, and the Sort by / Order selects —
 * renders only once that filter has been added. */
function RecipesFiltersBar({
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
  const [internalActiveFilters, setInternalActiveFilters] = useState<RecipesPageFilterId[]>(() => {
    const seeded: RecipesPageFilterId[] = [];
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

  const setActive = (next: RecipesPageFilterId[]) => {
    if (activeFilters === undefined) setInternalActiveFilters(next);
    onActiveFiltersChange?.(next);
  };
  const setChooserOpen = (open: boolean) => {
    if (filterChooserOpen === undefined) setInternalChooserOpen(open);
    onFilterChooserOpenChange?.(open);
  };
  const addFilter = (id: RecipesPageFilterId) => {
    setActive([...active, id]);
    setChooserOpen(false);
  };
  const removeFilter = (id: RecipesPageFilterId) => {
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
          <SearchField value={search} onChangeText={onSearchChange} placeholder="Search recipes…" />
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

function Thumbnail({ imageUrl }: { imageUrl?: string | null | undefined }) {
  return imageUrl ? (
    <Image
      src={imageUrl}
      width="$16"
      height="$16"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.gray.gray1}
      objectFit="cover"
    />
  ) : (
    <View
      width="$16"
      height="$16"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.gray.gray2}
    />
  );
}

// Touch-target geometry for the row's log-cook control: a ≥44dp
// target (the StarRatingInput precedent) centering its glyphs.
// Plain object, no StyleSheet, like the row's other geometry.
const logCookTargetStyle = {
  minWidth: 44,
  minHeight: 44,
  alignItems: "center",
  justifyContent: "center",
} as const;

const STAR_STEPS = [1, 2, 3, 4, 5] as const;

/** The rated state of the row's log-cook control: the recipe's
 * rating as five stars in the DS star language (StarRatingInput:
 * ★ in warning amber when filled, gray when not). The rating is a
 * display average as often as a personal star count, so the stars
 * fill by rounding to the nearest whole star; the pressable's
 * accessibility label carries the exact value. No lineHeight is
 * set on the glyphs — see the #162 note in the file header. */
function RatingStars({ rating }: { rating: number }) {
  const filled = Math.min(5, Math.max(1, Math.round(rating)));
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

/** The row's only action: log a cook. A rated recipe's stars are
 * the button; an unrated recipe gets a single icon-only button —
 * one unfilled star in the same glyph and tone, no text. Both fire
 * the row's `onLogCookPress`, and both carry an accessibility
 * label that names the action and the recipe: the stars alone
 * would announce as a rating, not as the log-cook action they
 * perform here. The control renders inside the text block's
 * subtitle flow (see RecipeRow) — never as an item of the card
 * row, where its width starved the text column (#205, and again
 * in PR #120's narrow captures when it sat at the row's edge).
 * Since #248 the text block is a link, so the control's press
 * handler also cancels the click's default action on web —
 * otherwise the wrapping anchor would navigate as well as log
 * (see handlePress below). */
function LogCookControl({
  item,
  onLogCookPress,
}: {
  item: RecipesPageItem;
  onLogCookPress: () => void;
}) {
  const rating = item.rating;
  // The control renders inside the row's text link (#248), and
  // on web the wrapping anchor would ALSO follow its href when
  // the control is clicked: react-native-web's press handling
  // stops the click's propagation but does not cancel its
  // default action (verified in its PressResponder source — the
  // conditional preventDefault covers only long-press and
  // selection-terminated presses). Cancelling the default in
  // the control's own press handler — the one handler certain
  // to run for its clicks — keeps a log-cook press from also
  // navigating. On native the call is inert: the innermost
  // press target wins the responder, as it did when the row's
  // outer target was a pressable too.
  const handlePress = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onLogCookPress();
  };
  if (rating !== null && rating !== undefined && rating > 0) {
    return (
      <TouchableOpacity
        style={logCookTargetStyle}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Log a cook of ${item.title}, rated ${rating} out of 5 stars`}
      >
        <RatingStars rating={rating} />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={logCookTargetStyle}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Log a cook of ${item.title}`}
    >
      <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.gray.gray4 }}>
        ★
      </Text>
    </TouchableOpacity>
  );
}

function RecipeRow({
  item,
  onLogCookPress,
}: {
  item: RecipesPageItem;
  onLogCookPress?: () => void;
}) {
  const textContent = (
    <>
      <Text fontWeight={tokens.typography.fontWeight.semibold}>{item.title}</Text>
      {/* The subtitle line is a wrapping inline flow inside the
        text block: the subtitle text first, the log-cook
        control immediately after it (right after the
        subtitle's final segment). The control flows with the
        text — when the line is full it wraps onto the next
        line of the block, at the block's full width — instead
        of sitting in the card row as a third flex item whose
        fixed width starved this block (the #205 failure, seen
        again in PR #120's narrow captures). */}
      {item.subtitle || onLogCookPress ? (
        <XStack flexWrap="wrap" alignItems="center" gap="$1" paddingTop="$1">
          {item.subtitle ? <Text variant="hint">{item.subtitle}</Text> : null}
          {onLogCookPress ? <LogCookControl item={item} onLogCookPress={onLogCookPress} /> : null}
        </XStack>
      ) : null}
    </>
  );
  return (
    <YStack paddingBlockEnd="$3">
      <Card variant="elevated" flexDirection="row" flexWrap="wrap" alignItems="center" gap="$3">
        {/* Both navigation targets are links carrying the recipe's
          href (#248) and an accessible name built from the recipe
          title: the thumbnail target wraps only an image (or an
          empty placeholder), so without the label a screen reader
          meets an unidentified link for every recipe. The text
          target's label also carries the subtitle when present — a
          title-only label would override the name React Native
          derives from its Text children and drop the subtitle
          announcement. The log-cook control is a third press
          target nested in the text block's subtitle flow; its
          label names the action instead — see LogCookControl.
          On native the anchors are Texts and cannot carry these
          view subtrees (the text block's texts would flow inline
          and the thumbnail would be measured as text), so both
          targets platform-split (see LinkOverlay): view-level
          frames carry the content, and childless anchors
          stretched over the frames carry the hrefs. The log-cook
          control stays nested in the text frame's subtitle flow,
          above the frame's overlay, and keeps its own presses. */}
        {isWeb ? (
          <Anchor
            href={item.href}
            textDecorationLine="none"
            display="web:flex"
            {...platformAccessibilityProps({
              accessibilityRole: "link",
              accessibilityLabel: item.title,
            })}
          >
            <Thumbnail imageUrl={item.imageUrl} />
          </Anchor>
        ) : (
          <View position="relative">
            <LinkOverlay
              href={item.href}
              accessibilityRole="link"
              accessibilityLabel={item.title}
            />
            <Thumbnail imageUrl={item.imageUrl} />
          </View>
        )}
        {isWeb ? (
          <Anchor
            href={item.href}
            textDecorationLine="none"
            display="web:flex"
            flexDirection="column"
            style={textBlockStyle}
            {...platformAccessibilityProps({
              accessibilityRole: "link",
              accessibilityLabel: item.subtitle ? `${item.title}, ${item.subtitle}` : item.title,
            })}
          >
            {textContent}
          </Anchor>
        ) : (
          <YStack style={textBlockStyle} position="relative">
            <LinkOverlay
              href={item.href}
              accessibilityRole="link"
              accessibilityLabel={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
            />
            {textContent}
          </YStack>
        )}
      </Card>
    </YStack>
  );
}

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

  return (
    <ScreenContainer variant="list" scrollable={false}>
      <FlatList
        style={listStyle}
        // The filter controls live inside this scroll view, so taps on
        // them must land while the keyboard is open instead of being
        // consumed to dismiss it.
        keyboardShouldPersistTaps="handled"
        data={isLoading ? [] : recipes}
        keyExtractor={(recipe) => recipe.id}
        contentContainerStyle={listContentStyle}
        // The filters render as the list's header so they scroll
        // together with the recipes (#188). The header sits inside
        // the list's content container, which already supplies the
        // horizontal padding. The list (and therefore the header)
        // stays mounted while loading — a filter edit flips isLoading
        // and a tree swap would unmount the focused filter input
        // mid-typing; the loading indicator renders as the list's
        // empty state instead.
        ListHeaderComponent={
          <YStack paddingBlockStart="$4" paddingBlockEnd="$2">
            <RecipesFiltersBar {...props} />
          </YStack>
        }
        renderItem={({ item }) => {
          const accessory = renderRecipeAccessory ? renderRecipeAccessory(item.id) : null;
          const hasAccessory = accessory !== null && accessory !== undefined;
          return (
            <>
              <RecipeRow
                item={item}
                {...(onLogCookPress && !hasAccessory
                  ? {
                      onLogCookPress: () => {
                        onLogCookPress(item.id);
                      },
                    }
                  : {})}
              />
              {hasAccessory ? <YStack paddingBlockEnd="$3">{accessory}</YStack> : null}
            </>
          );
        }}
        onEndReached={onEndReached}
        onScroll={onScroll}
        onEndReachedThreshold={onEndReachedThreshold}
        ListEmptyComponent={
          isLoading ? (
            <YStack paddingBlockStart="$8" alignItems="center">
              <Spinner label="Loading" />
            </YStack>
          ) : (
            <EmptyState title={emptyTitle} {...(emptyBody ? { body: emptyBody } : {})} />
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
