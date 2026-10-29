import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../components/Text.js";
import { View } from "tamagui";
import { RecipesPage, type RecipesPageFilterId, type RecipesPageItem } from "./RecipesPage.js";
import { tokens } from "../tokens/index.js";

/**
 * Stories for the real RecipesPage component (#49 pilot) — not a
 * made-up page composition: this renders the same component the
 * Eciperay app will consume, driven by fixture props. It succeeds
 * the Recipes browse demo in Pages/Eciperay (#44), whose fixtures
 * below mirror that demo's data; the #44 demos are retired
 * (#185) and these stories are the spec.
 *
 * The Shared* stories carry the Shared-with-me configuration of
 * the same component (#185 — SharedWithMePage is consolidated
 * into RecipesPage): press-only rows (no log-cook control, no
 * accessory slot) and the shared screen's own empty-state copy,
 * succeeding SharedWithMePage.stories.tsx and its four states.
 *
 * The frame differs from the Pages PageFrame on purpose: PageFrame
 * leaves height unbounded so the story canvas owns it, but a real
 * FlatList needs a bounded viewport to virtualize against — an
 * unbounded one is also exactly the #188 failure shape. So the
 * frame pins a phone viewport (430×844) and the list bounds inside
 * it. Fixed dimensions keep Chromatic screenshots deterministic.
 * Theme pinned to Warm Harvest, Eciperay's brand, like Pages/Eciperay.
 */
const meta: Meta<typeof RecipesPage> = {
  title: "Pages/Eciperay/RecipesPage",
  component: RecipesPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipesPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

// Ratings ride the view model separately (`rating`), the way the
// app passes its display rating; the subtitle stays rating-free.
// The mix is deliberate: rated rows render their stars as the
// log-cook control, unrated rows (Arroz con Pollo, Beef Chili)
// render the icon-only button.
const recipeItems: RecipesPageItem[] = [
  {
    id: "tuscan-chicken",
    title: "Creamy Tuscan Garlic Chicken",
    subtitle: "4 servings · 30 min · Satiety 60",
    rating: 4.5,
  },
  {
    id: "stuffed-peppers",
    title: "Classic Stuffed Peppers",
    subtitle: "6 servings · 45 min · Satiety 72",
    rating: 5,
  },
  { id: "arroz-con-pollo", title: "Arroz con Pollo", subtitle: "8 servings · 50 min · Satiety 68" },
  {
    id: "fudgy-brownies",
    title: "Fudgy Brownies",
    subtitle: "12 servings · 35 min · Satiety 40",
    rating: 3,
  },
  {
    id: "chicken-tikka",
    title: "Chicken Tikka Masala",
    subtitle: "4 servings · 40 min · Satiety 64",
    rating: 4,
  },
  { id: "beef-chili", title: "Beef Chili", subtitle: "6 servings · 60 min · Satiety 75" },
  {
    id: "pollo-brasa",
    title: "Pollo a la Brasa",
    subtitle: "4 servings · 55 min · Satiety 70",
    rating: 4,
  },
];

function RecipesPageDemo({
  initialSearch = "",
  recipes = recipeItems,
  isLoading = false,
  isFetchingNextPage = false,
  expandedRecipeId,
  initialActiveFilters,
  initialFilterChooserOpen = false,
}: {
  initialSearch?: string;
  recipes?: RecipesPageItem[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  expandedRecipeId?: string;
  initialActiveFilters?: RecipesPageFilterId[];
  initialFilterChooserOpen?: boolean;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ingredient, setIngredient] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minSatiety, setMinSatiety] = useState("");
  const [maxSatiety, setMaxSatiety] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortDir, setSortDir] = useState("desc");
  // The #96 collapsed-filter state, held by the demo the way the
  // app will hold it: which filters are added, and whether the
  // add-filter chooser is open.
  const [activeFilters, setActiveFilters] = useState(initialActiveFilters ?? []);
  const [filterChooserOpen, setFilterChooserOpen] = useState(initialFilterChooserOpen);

  // The app filters server-side; the demo filters its fixtures by the
  // search text so the filtered state is honest about what the app
  // would pass back.
  const visible = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Viewport>
      <RecipesPage
        recipes={visible}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onRecipePress={() => undefined}
        onLogCookPress={() => undefined}
        {...(expandedRecipeId
          ? {
              // Fixture stand-in for the app's inline cook-log form:
              // a plain expanded panel, not a form — the form is
              // business logic and stays app-side. Returning content
              // for one row also hides that row's log-cook control.
              renderRecipeAccessory: (recipeId: string) =>
                recipeId === expandedRecipeId ? (
                  <View
                    borderWidth={1}
                    borderColor="#b08968"
                    borderStyle="dashed"
                    borderRadius={8}
                    paddingVertical={12}
                    paddingHorizontal={16}
                  >
                    <Text variant="body">
                      Cook log form renders here (app-side fixture stand-in)
                    </Text>
                  </View>
                ) : null,
            }
          : {})}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ingredient={ingredient}
        onIngredientChange={setIngredient}
        minCalories={minCalories}
        onMinCaloriesChange={setMinCalories}
        maxCalories={maxCalories}
        onMaxCaloriesChange={setMaxCalories}
        minSatiety={minSatiety}
        onMinSatietyChange={setMinSatiety}
        maxSatiety={maxSatiety}
        onMaxSatietyChange={setMaxSatiety}
        sort={sort}
        onSortChange={setSort}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
        activeFilters={activeFilters}
        onActiveFiltersChange={setActiveFilters}
        filterChooserOpen={filterChooserOpen}
        onFilterChooserOpenChange={setFilterChooserOpen}
      />
    </Viewport>
  );
}

export const Default: Story = {
  render: () => <RecipesPageDemo />,
};

export const Filtered: Story = {
  render: () => <RecipesPageDemo initialSearch="chicken" />,
};

export const Empty: Story = {
  render: () => <RecipesPageDemo initialSearch="quiche" />,
};

export const Loading: Story = {
  render: () => <RecipesPageDemo isLoading recipes={[]} />,
};

export const LoadingMore: Story = {
  // The pagination-in-flight state (#292): rows stay rendered and
  // the footer spinner shows below them while the next page loads —
  // the DiscoverPage LoadingMore story's counterpart.
  render: () => <RecipesPageDemo isFetchingNextPage />,
};

export const FilterChooserOpen: Story = {
  // The #96 chooser state: search + Filters button, with the
  // add-filter options (every filter not yet added) showing.
  render: () => <RecipesPageDemo initialFilterChooserOpen />,
};

export const WithFiltersAdded: Story = {
  // The #96 added state: only the added filters' controls render
  // (here Status and Ingredient), each with its Remove control;
  // the remaining filters stay collapsed behind the button.
  render: () => <RecipesPageDemo initialActiveFilters={["status", "ingredient"]} />,
};

export const ExpandedAccessory: Story = {
  // The first recipe: the filter header plus three cards would push
  // a later row's accessory below the fixed viewport, and the list
  // has no scroll step in the snapshot — the expanded row must be
  // the one visible in the initial frame.
  render: () => <RecipesPageDemo expandedRecipeId="tuscan-chicken" />,
};

// The Shared-with-me configuration's fixtures: the old
// SharedWithMePage stories' items, unchanged. No ratings — the
// shared screen's rows are press-only, so no rating ever renders.
const sharedItems: RecipesPageItem[] = [
  { id: "arroz-con-pollo", title: "Arroz con Pollo", subtitle: "8 servings · 50 min · Satiety 68" },
  { id: "fudgy-brownies", title: "Fudgy Brownies", subtitle: "12 servings · 35 min · Satiety 40" },
  { id: "banana-bread", title: "Banana Bread", subtitle: "10 servings · 60 min · Satiety 55" },
  {
    id: "tuscan-chicken",
    title: "Creamy Tuscan Garlic Chicken",
    subtitle: "4 servings · 30 min · Satiety 60",
  },
  { id: "beef-chili", title: "Beef Chili", subtitle: "6 servings · 60 min · Satiety 75" },
  {
    id: "stuffed-peppers",
    title: "Classic Stuffed Peppers",
    subtitle: "6 servings · 45 min · Satiety 72",
  },
  {
    id: "chicken-tikka",
    title: "Chicken Tikka Masala",
    subtitle: "4 servings · 40 min · Satiety 64",
  },
];

/**
 * The Shared-with-me configuration (#185): the same component with
 * the shared host's contract — no `onLogCookPress` and no
 * `renderRecipeAccessory` (press-only rows), the shared screen's
 * empty-state copy, and the collapsed filter bar left uncontrolled
 * (no `activeFilters` / `filterChooserOpen` props), the way the
 * SharedWithMe host adopts it with no new state.
 */
function SharedRecipesPageDemo({
  initialSearch = "",
  recipes = sharedItems,
  isLoading = false,
}: {
  initialSearch?: string;
  recipes?: RecipesPageItem[];
  isLoading?: boolean;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ingredient, setIngredient] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minSatiety, setMinSatiety] = useState("");
  const [maxSatiety, setMaxSatiety] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortDir, setSortDir] = useState("desc");

  // The app filters server-side; the demo filters its fixtures by
  // the search text so the filtered state is honest about what the
  // app would pass back.
  const visible = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Viewport>
      <RecipesPage
        recipes={visible}
        isLoading={isLoading}
        onRecipePress={() => undefined}
        emptyTitle="Recipes others share with you will appear here."
        emptyBody="Open a share link while signed in to save recipes to this list."
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ingredient={ingredient}
        onIngredientChange={setIngredient}
        minCalories={minCalories}
        onMinCaloriesChange={setMinCalories}
        maxCalories={maxCalories}
        onMaxCaloriesChange={setMaxCalories}
        minSatiety={minSatiety}
        onMinSatietyChange={setMinSatiety}
        maxSatiety={maxSatiety}
        onMaxSatietyChange={setMaxSatiety}
        sort={sort}
        onSortChange={setSort}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
      />
    </Viewport>
  );
}

export const SharedDefault: Story = {
  render: () => <SharedRecipesPageDemo />,
};

export const SharedFiltered: Story = {
  render: () => <SharedRecipesPageDemo initialSearch="chicken" />,
};

export const SharedEmpty: Story = {
  render: () => <SharedRecipesPageDemo initialSearch="quiche" />,
};

export const SharedLoading: Story = {
  render: () => <SharedRecipesPageDemo isLoading recipes={[]} />,
};
