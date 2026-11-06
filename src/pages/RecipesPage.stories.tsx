import { eciperayFooterFixture } from "./fixtures.js";
import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../widgets/Text.js";
import { View } from "tamagui";
import {
  RecipesPage,
  type RecipesPageDiscoveryItem,
  type RecipesPageFilterId,
  type RecipesPageItem,
} from "./RecipesPage.js";
import { tokens } from "../tokens/index.js";

/**
 * Stories for the real unified RecipesPage component (#415) —
 * not a made-up page composition: this renders the same
 * component the Eciperay app will consume for its single
 * "Recipes" browse, driven by fixture props. The page renders
 * the user's own material (created + shared-with-me, shared
 * items carrying their caller-supplied badge) first, then
 * public discovery content, under ONE search/filter bar.
 *
 * The own-section fixtures below mirror the retired #44 browse
 * demo's data; the discovery fixtures mirror DiscoverPage's
 * stories (the app's composed "By {author} · {rating} ·
 * {satiety}" subtitle and the permalink href shape). The
 * Shared* stories of the #185 consolidation are retired with
 * that contract: shared-with-me is no longer a separate
 * configuration of this page — it is the badged items inside
 * Default's own section.
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
// render the icon-only button. Two rows (Arroz con Pollo, Fudgy
// Brownies) carry the caller-supplied shared-with-me badge —
// they are the recipes someone shared with the user; the rest
// are the user's own creations and carry no badge.
const recipeItems: RecipesPageItem[] = [
  {
    id: "tuscan-chicken",
    href: "/recipes/tuscan-chicken",
    title: "Creamy Tuscan Garlic Chicken",
    subtitle: "4 servings · 30 min · Satiety 60",
    rating: 4.5,
  },
  {
    id: "stuffed-peppers",
    href: "/recipes/stuffed-peppers",
    title: "Classic Stuffed Peppers",
    subtitle: "6 servings · 45 min · Satiety 72",
    rating: 5,
  },
  {
    id: "arroz-con-pollo",
    href: "/recipes/arroz-con-pollo",
    title: "Arroz con Pollo",
    subtitle: "8 servings · 50 min · Satiety 68",
    badgeLabel: "Shared with you",
  },
  {
    id: "fudgy-brownies",
    href: "/recipes/fudgy-brownies",
    title: "Fudgy Brownies",
    subtitle: "12 servings · 35 min · Satiety 40",
    rating: 3,
    badgeLabel: "Shared with you",
  },
  {
    id: "chicken-tikka",
    href: "/recipes/chicken-tikka",
    title: "Chicken Tikka Masala",
    subtitle: "4 servings · 40 min · Satiety 64",
    rating: 4,
  },
  {
    id: "beef-chili",
    href: "/recipes/beef-chili",
    title: "Beef Chili",
    subtitle: "6 servings · 60 min · Satiety 75",
  },
  {
    id: "pollo-brasa",
    href: "/recipes/pollo-brasa",
    title: "Pollo a la Brasa",
    subtitle: "4 servings · 55 min · Satiety 70",
    rating: 4,
  },
];

// The discovery section's fixtures: DiscoverPage's story items,
// unchanged — the public catalog's composed subtitle line and
// permalink hrefs.
const discoveryItems: RecipesPageDiscoveryItem[] = [
  {
    id: "tuscan-chicken",
    title: "Creamy Tuscan Garlic Chicken",
    subtitle: "By Maria · ★ 4.5 · Satiety 60",
    href: "/recipe/tuscan-chicken/creamy-tuscan-garlic-chicken",
  },
  {
    id: "stuffed-peppers",
    title: "Classic Stuffed Peppers",
    subtitle: "By Anonymous · ★ 5 · Satiety 72",
    href: "/recipe/stuffed-peppers/classic-stuffed-peppers",
  },
  {
    id: "arroz-con-pollo",
    title: "Arroz con Pollo",
    subtitle: "By Diego · ★ 4 · Satiety 68",
    href: "/recipe/arroz-con-pollo/arroz-con-pollo",
  },
  {
    id: "fudgy-brownies",
    title: "Fudgy Brownies",
    subtitle: "By Priya · ★ 3.5 · Satiety 40",
    href: "/recipe/fudgy-brownies/fudgy-brownies",
  },
  {
    id: "beef-chili",
    title: "Beef Chili",
    subtitle: "By Sam · ★ 4 · Satiety 75",
    href: "/recipe/beef-chili/beef-chili",
  },
];

function RecipesPageDemo({
  initialSearch = "",
  ownRecipes = recipeItems,
  discoveryRecipes = discoveryItems,
  loadingOwn = false,
  loadingDiscovery = false,
  ownErrorMessage = null,
  discoveryErrorMessage = null,
  isFetchingNextPage = false,
  expandedRecipeId,
  initialActiveFilters,
  initialFilterChooserOpen = false,
}: {
  initialSearch?: string;
  ownRecipes?: RecipesPageItem[];
  discoveryRecipes?: RecipesPageDiscoveryItem[];
  loadingOwn?: boolean;
  loadingDiscovery?: boolean;
  ownErrorMessage?: string | null;
  discoveryErrorMessage?: string | null;
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

  // The app filters server-side; the demo filters BOTH sections'
  // fixtures by the one search text so the filtered state is
  // honest about what the app would pass back for the unified
  // collection.
  const visibleOwn = ownRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase()),
  );
  const visibleDiscovery = discoveryRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Viewport>
      <RecipesPage
        footer={eciperayFooterFixture}
        ownTitle="Your recipes"
        ownRecipes={visibleOwn}
        loadingOwn={loadingOwn}
        ownErrorMessage={ownErrorMessage}
        discoveryTitle="Discover"
        discoveryRecipes={visibleDiscovery}
        loadingDiscovery={loadingDiscovery}
        discoveryErrorMessage={discoveryErrorMessage}
        isFetchingNextPage={isFetchingNextPage}
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
  // The populated unified page: own + shared (badged) recipes
  // first under "Your recipes", then public discovery content
  // under "Discover", one search/filter bar above both.
  render: () => <RecipesPageDemo />,
};

export const Filtered: Story = {
  render: () => <RecipesPageDemo initialSearch="chicken" />,
};

export const Empty: Story = {
  // Both sections empty: each collapses to its own empty state
  // under its heading — the own section does not disappear.
  render: () => <RecipesPageDemo initialSearch="quiche" />,
};

export const Loading: Story = {
  render: () => (
    <RecipesPageDemo loadingOwn loadingDiscovery ownRecipes={[]} discoveryRecipes={[]} />
  ),
};

export const LoadingMore: Story = {
  // The pagination-in-flight state (#292): rows stay rendered and
  // the footer spinner shows below them while the discovery
  // section's next page loads — the DiscoverPage LoadingMore
  // story's counterpart.
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

export const OwnOnly: Story = {
  // Own material only: the discovery section collapses to its
  // empty state under its heading; the own rows render above it.
  render: () => <RecipesPageDemo discoveryRecipes={[]} />,
};

export const DiscoveryOnly: Story = {
  // Discovery only (the user has no own/shared recipes yet): the
  // own section collapses to its empty state rather than
  // disappearing, and the public content renders below it.
  render: () => <RecipesPageDemo ownRecipes={[]} />,
};

export const DiscoveryError: Story = {
  // Section independence: the discovery load failed, so its
  // section shows the error alert — the user's own recipes
  // above it render untouched.
  render: () => (
    <RecipesPageDemo
      discoveryRecipes={[]}
      discoveryErrorMessage="We couldn't load public recipes. Check your connection and try again."
    />
  ),
};
