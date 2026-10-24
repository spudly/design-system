import { useState, type ReactNode } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Image, View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SearchField } from "../components/SearchField.js";
import { SelectField, type SelectOption } from "../components/SelectField.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

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
 *   as the list's empty state. test/recipes-page-bounded-list.test.mjs
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
 * is non-null, that row's "Log cook" button is hidden — the app
 * reproduces its card's button-hides-while-the-form-is-open
 * behavior purely by what it returns (the form for the open row,
 * null everywhere else). The form itself, its state, and its
 * mutation stay in the app; other rows' buttons and the
 * `onLogCookPress` firing semantics are unchanged.
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
// within the row (mirrors the app's ThumbnailListCard).
const textBlockStyle = { flex: 1, minWidth: 0 } as const;

/** One recipe row's view-model. The app formats `subtitle` (its list
 * meta line — servings · time · rating/satiety); the view only
 * renders it. */
export interface RecipesPageItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
}

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

export interface RecipesPageProps {
  /** Recipes to render, already filtered/sorted by the app. */
  recipes: RecipesPageItem[];
  /** First-load in flight: the list renders empty with a spinner as
   * its empty state, and the filter bar stays mounted. */
  isLoading: boolean;
  /** Next page in flight: a spinner renders as the list footer. */
  isFetchingNextPage?: boolean;
  onRecipePress: (recipeId: string) => void;
  /** Optional row actions, mirroring the app card's buttons. "Log
   * cook" is a callback only — the cook-log form and its mutation
   * stay in the app, which renders them (see
   * `renderRecipeAccessory`); the view owns the button. */
  onLogCookPress?: (recipeId: string) => void;
  onRecipeDelete?: (recipeId: string) => void;
  /** Optional per-row accessory slot: called once per row with the
   * row's id; the returned node renders directly under that row's
   * card, inside the list item. Return null/undefined to render
   * nothing. When a row's accessory renders non-null content, that
   * row's "Log cook" button is hidden — the app returns its inline
   * cook-log form for the row whose form is open and null elsewhere,
   * which reproduces the app card's button-hides-while-open
   * behavior. */
  renderRecipeAccessory?: (recipeId: string) => ReactNode;
  /** Pagination hook, wired to the list's end-reached signal. */
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
}

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
      <XStack gap={tokens.spacing[2]} alignItems="flex-start">
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

function RecipeRow({
  item,
  onPress,
  onLogCookPress,
  onDeletePress,
}: {
  item: RecipesPageItem;
  onPress: () => void;
  onLogCookPress?: () => void;
  onDeletePress?: () => void;
}) {
  return (
    <Card variant="elevated" flexDirection="row" alignItems="center" gap="$3" marginBottom="$3">
      {/* Both press targets carry the button role and an accessible
          name built from the recipe title: the thumbnail target
          wraps only an image (or an empty placeholder), so without
          the label a screen reader meets an unidentified action
          for every recipe. The text target's label also carries
          the subtitle when present — a title-only label would
          override the name React Native derives from its Text
          children and drop the subtitle announcement. */}
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <Thumbnail imageUrl={item.imageUrl} />
      </TouchableOpacity>
      <TouchableOpacity
        style={textBlockStyle}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
      >
        <Text fontWeight={tokens.typography.fontWeight.semibold}>{item.title}</Text>
        {item.subtitle ? (
          <Text variant="hint" marginTop="$1">
            {item.subtitle}
          </Text>
        ) : null}
      </TouchableOpacity>
      {onLogCookPress || onDeletePress ? (
        <XStack marginInlineStart="$3" alignItems="center" gap="$2">
          {onLogCookPress ? (
            <Button
              variant="secondary"
              size="sm"
              backgroundColor={tokens.colors.gray.gray2}
              color={tokens.colors.gray.gray8}
              onPress={onLogCookPress}
            >
              Log cook
            </Button>
          ) : null}
          {onDeletePress ? (
            <Button
              variant="secondary"
              size="sm"
              backgroundColor={tokens.colors.danger.danger1}
              color={tokens.colors.danger.danger8}
              onPress={onDeletePress}
            >
              Delete
            </Button>
          ) : null}
        </XStack>
      ) : null}
    </Card>
  );
}

/**
 * Full-page Browse/Recipes view: the filter bar and recipe list in
 * the fixed `list` shell. Controlled — see the file header for the
 * contract and the layout regressions its structure guards.
 */
export function RecipesPage(props: RecipesPageProps) {
  const {
    recipes,
    isLoading,
    isFetchingNextPage = false,
    onRecipePress,
    onLogCookPress,
    onRecipeDelete,
    onLoadMore,
    renderRecipeAccessory,
  } = props;

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
                onPress={() => {
                  onRecipePress(item.id);
                }}
                {...(onLogCookPress && !hasAccessory
                  ? {
                      onLogCookPress: () => {
                        onLogCookPress(item.id);
                      },
                    }
                  : {})}
                {...(onRecipeDelete
                  ? {
                      onDeletePress: () => {
                        onRecipeDelete(item.id);
                      },
                    }
                  : {})}
              />
              {hasAccessory ? <YStack marginBlockEnd="$3">{accessory}</YStack> : null}
            </>
          );
        }}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? (
            <YStack marginBlockStart="$8" alignItems="center">
              <Spinner label="Loading" />
            </YStack>
          ) : (
            <EmptyState title="No recipes found." />
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
