import { FlatList, TouchableOpacity } from "react-native";
import { Image, View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card } from "../components/Card.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SearchField } from "../components/SearchField.js";
import { SelectField, type SelectOption } from "../components/SelectField.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * SharedWithMePage (#49): Eciperay's Shared-with-me screen as a
 * controlled @spudly/ui page component — the second page ported
 * after the RecipesPage pilot, with the same discipline: the app
 * keeps all state and business logic (the shared-with-me query,
 * filter state, pagination, permalink construction) and drives
 * this view entirely through props. Nothing here imports an app
 * package or fetches anything.
 *
 * Placement: src/pages behind the `@spudly/ui/pages` subpath
 * export, not the package root — see RecipesPage.tsx for why
 * (react-native imports must stay out of the Node-importable root
 * entry).
 *
 * The composition mirrors the app's SharedWithMeView
 * (spudly/eciperay packages/app) exactly. That screen is the
 * Recipes screen's sibling in the app — it shares the same filter
 * bar (RecipeListFiltersBar), the same filter state hook, and the
 * same fixed `list` shell — so this page shares RecipesPage's
 * structure:
 * - The filter bar is control-for-control the app's shared bar,
 *   rendered as the list's header so it scrolls with the recipes,
 *   and the list stays mounted while loading (the spinner is the
 *   list's empty state) so a filter edit cannot unmount the
 *   focused input mid-typing.
 * - #188: the FlatList is bounded to the shell with `flex: 1`
 *   (see listStyle) — the same unreachable-list geometry the app
 *   fixed on both list screens.
 * - #162: this screen is where that failure was captured on
 *   device; search uses the DS SearchField as-is, with no
 *   lineHeight set on any glyph or text in this file.
 *
 * Where this screen differs from Recipes, the contract differs:
 * - Rows have NO actions. A shared recipe card is thumbnail,
 *   title, subtitle, and a press — in the app the press opens the
 *   recipe's permalink in the browser (the app builds the URL
 *   from its own base-URL constant and calls Linking; here it is
 *   just `onRecipePress(id)`). There is no Log cook, no Delete,
 *   and nothing trailing on the card.
 * - No accessory slot, deliberately. The cook-log lesson from
 *   RecipesPage was to audit for app-rendered content inside the
 *   view and design a render surface for it up front; this screen
 *   has none — no expandable area, no form, no custom row
 *   content — so a slot would be a surface nothing renders into.
 *   The contract is callbacks-only because the screen is.
 * - No title. The app's props type carries a `showTitle` flag
 *   and the screen passes `false`, but the native view never
 *   renders a title (the flag exists for the web mirror), so the
 *   page omits it rather than carrying an inert prop.
 * - The empty state is the app's shared-with-me message. The app
 *   renders its two sentences as one string; EmptyState's
 *   title/body split carries them verbatim, one sentence each.
 *
 * The #44 Pages/Eciperay "SharedWithMe" demo is not this screen:
 * it composes a heading, sharer avatars, and "Shared by" lines
 * the real screen does not have, and omits the filter bar the
 * real screen leads with. Like the Recipes demo, it stays as a
 * snapshot spec until the app rewires onto this component; where
 * the two disagree, the app screen — and this page — win.
 */

// List content geometry on the DS spacing scale, mirroring the app
// screen (plain object, no StyleSheet).
const listContentStyle = {
  paddingHorizontal: tokens.spacing[4],
  paddingBottom: tokens.spacing[8],
} as const;

// The FlatList must be bounded to the space the fixed `list` shell
// leaves it (#188): without flex: 1 it sizes to its full content
// height inside the non-scrolling shell, overflows the viewport,
// and never gets a scrollable viewport of its own.
const listStyle = { flex: 1 } as const;

// Structural flex only: the card's text block expands and may
// shrink within the row (mirrors the app's ThumbnailListCard).
const textBlockStyle = { flex: 1, minWidth: 0 } as const;

/** One shared recipe row's view-model. The app formats `subtitle`
 * (its list meta line — servings · time · rating/satiety); the
 * view only renders it. */
export type SharedWithMePageItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
};

// The filter option sets the app's filter bar hardcodes, moved
// with the bar (identical to RecipesPage's — the app shares one
// filter bar between the two screens). Values stay plain strings
// so no app type leaks into the DS: the app maps its own
// status/sort unions at the boundary.
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

export type SharedWithMePageProps = {
  /** Shared recipes to render, already filtered/sorted by the app. */
  recipes: SharedWithMePageItem[];
  /** First-load in flight: the list renders empty with a spinner
   * as its empty state, and the filter bar stays mounted. */
  isLoading: boolean;
  /** Next page in flight: a spinner renders as the list footer. */
  isFetchingNextPage?: boolean;
  /** Row press. In the app this opens the recipe's permalink
   * externally; the view only reports the press, by id. */
  onRecipePress: (recipeId: string) => void;
  /** Pagination hook, wired to the list's end-reached signal. */
  onLoadMore?: () => void;

  search: string;
  onSearchChange: (value: string) => void;
  /** Status filter. The control renders only when both the value
   * and its callback are provided and `showStatusFilter` is not
   * false — the same condition as the app's filter bar. */
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
};

type FilterControlsProps = Pick<
  SharedWithMePageProps,
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

/** The filter bar, control-for-control the app's
 * RecipeListFiltersBar — the same bar RecipesPage carries, because
 * the app shares the one bar between the Recipes and
 * Shared-with-me screens: search, the status select, ingredient,
 * min/max calorie and satiety number fields, and the Sort by /
 * Order selects. */
function SharedWithMeFiltersBar({
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

function SharedRecipeRow({ item, onPress }: { item: SharedWithMePageItem; onPress: () => void }) {
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
    </Card>
  );
}

/**
 * Full-page Shared-with-me view: the filter bar and shared recipe
 * list in the fixed `list` shell. Controlled — see the file header
 * for the contract and the layout regressions its structure
 * guards.
 */
export function SharedWithMePage(props: SharedWithMePageProps) {
  const { recipes, isLoading, isFetchingNextPage = false, onRecipePress, onLoadMore } = props;

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
        // The filters render as the list's header so they scroll
        // together with the recipes (#188). The header sits inside
        // the list's content container, which already supplies the
        // horizontal padding. The list (and therefore the header)
        // stays mounted while loading — a filter edit flips
        // isLoading and a tree swap would unmount the focused
        // filter input mid-typing; the loading indicator renders
        // as the list's empty state instead.
        ListHeaderComponent={
          <YStack paddingBlockStart="$4" paddingBlockEnd="$2">
            <SharedWithMeFiltersBar {...props} />
          </YStack>
        }
        renderItem={({ item }) => (
          <SharedRecipeRow
            item={item}
            onPress={() => {
              onRecipePress(item.id);
            }}
          />
        )}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? (
            <YStack marginBlockStart="$8" alignItems="center">
              <Spinner label="Loading" />
            </YStack>
          ) : (
            <EmptyState
              title="Recipes others share with you will appear here."
              body="Open a share link while signed in to save recipes to this list."
            />
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
