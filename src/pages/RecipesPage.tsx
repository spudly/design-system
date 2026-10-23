import type { ReactNode } from "react";
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

/** The filter bar, control-for-control the app's RecipeListFiltersBar:
 * search, the status select, ingredient, min/max calorie and satiety
 * number fields, and the Sort by / Order selects. */
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
}: FilterControlsProps) {
  return (
    <YStack gap={tokens.spacing[3]}>
      <SearchField value={search} onChangeText={onSearchChange} placeholder="Search recipes…" />
      {showStatusFilter && statusFilter !== undefined && onStatusFilterChange ? (
        <SelectField
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onValueChange={onStatusFilterChange}
        />
      ) : null}
      <TextField
        label="Ingredient"
        accessibilityLabel="Ingredient"
        value={ingredient}
        onChangeText={onIngredientChange}
        placeholder="e.g. chicken"
      />
      <XStack gap={tokens.spacing[2]}>
        <NumberFilter label="Min cal" value={minCalories} onChange={onMinCaloriesChange} />
        <NumberFilter label="Max cal" value={maxCalories} onChange={onMaxCaloriesChange} />
      </XStack>
      <XStack gap={tokens.spacing[2]}>
        <NumberFilter label="Min satiety" value={minSatiety} onChange={onMinSatietyChange} />
        <NumberFilter label="Max satiety" value={maxSatiety} onChange={onMaxSatietyChange} />
      </XStack>
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
      {/* Both press targets carry the button role and the recipe
          title as their accessible name: the thumbnail target
          wraps only an image (or an empty placeholder), so without
          the label a screen reader meets an unidentified action
          for every recipe. */}
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
        accessibilityLabel={item.title}
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
              color={tokens.colors.danger.danger7}
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
