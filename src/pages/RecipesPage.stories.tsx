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
 * below mirror that demo's data; the demo stays as the spec until
 * the app rewires onto this component.
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

const recipeItems: RecipesPageItem[] = [
  {
    id: "tuscan-chicken",
    title: "Creamy Tuscan Garlic Chicken",
    subtitle: "4 servings · 30 min · Satiety 60",
  },
  {
    id: "stuffed-peppers",
    title: "Classic Stuffed Peppers",
    subtitle: "6 servings · 45 min · Satiety 72",
  },
  { id: "arroz-con-pollo", title: "Arroz con Pollo", subtitle: "8 servings · 50 min · Satiety 68" },
  { id: "fudgy-brownies", title: "Fudgy Brownies", subtitle: "12 servings · 35 min · Satiety 40" },
  {
    id: "chicken-tikka",
    title: "Chicken Tikka Masala",
    subtitle: "4 servings · 40 min · Satiety 64",
  },
  { id: "beef-chili", title: "Beef Chili", subtitle: "6 servings · 60 min · Satiety 75" },
  { id: "pollo-brasa", title: "Pollo a la Brasa", subtitle: "4 servings · 55 min · Satiety 70" },
];

function RecipesPageDemo({
  initialSearch = "",
  recipes = recipeItems,
  isLoading = false,
  expandedRecipeId,
  initialActiveFilters,
  initialFilterChooserOpen = false,
}: {
  initialSearch?: string;
  recipes?: RecipesPageItem[];
  isLoading?: boolean;
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
        onRecipePress={() => undefined}
        onLogCookPress={() => undefined}
        onRecipeDelete={() => undefined}
        {...(expandedRecipeId
          ? {
              // Fixture stand-in for the app's inline cook-log form:
              // a plain expanded panel, not a form — the form is
              // business logic and stays app-side. Returning content
              // for one row also hides that row's Log cook button.
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
