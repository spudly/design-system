import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { DiscoverPage, type DiscoverPageFilterId, type DiscoverPageItem } from "./DiscoverPage.js";

/**
 * Stories for the real DiscoverPage component (#168) — not a
 * made-up page composition: this renders the same component the
 * Eciperay web app will consume for its public `/discover`
 * catalog, driven by fixture props. Copy mirrors the app's
 * ("Discover recipes", "Search public recipes…", "No public
 * recipes match your search."); subtitles are the app's composed
 * "By {author} · {rating} · {satiety}" line, and each item's
 * `href` is the permalink shape the host builds
 * (`/recipe/{id}/{slug}`) — on web each card is a real anchor to
 * it. No image URLs: story fixtures never load external images,
 * so every thumbnail renders the placeholder block.
 *
 * The frame pins a phone viewport (430×844) like RecipesPage's
 * stories: a real FlatList needs a bounded viewport to
 * virtualize against, and fixed dimensions keep Chromatic
 * screenshots deterministic. Theme pinned to Warm Harvest,
 * Eciperay's brand, like Pages/Eciperay.
 */
const meta: Meta<typeof DiscoverPage> = {
  title: "Pages/Eciperay/DiscoverPage",
  component: DiscoverPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof DiscoverPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

const discoverItems: DiscoverPageItem[] = [
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

function DiscoverPageDemo({
  initialSearch = "",
  recipes = discoverItems,
  isLoading = false,
  isFetchingNextPage = false,
  errorMessage = null,
  initialActiveFilters,
  initialFilterChooserOpen = false,
}: {
  initialSearch?: string;
  recipes?: DiscoverPageItem[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  errorMessage?: string | null;
  initialActiveFilters?: DiscoverPageFilterId[];
  initialFilterChooserOpen?: boolean;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [ingredient, setIngredient] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minSatiety, setMinSatiety] = useState("");
  const [maxSatiety, setMaxSatiety] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortDir, setSortDir] = useState("desc");
  // The #96 collapsed-filter state, held by the demo the way the
  // app will hold it: which filters are added, and whether the
  // add-filter chooser is open. The public host passes no status
  // filter, so the demo doesn't either — the status control stays
  // unavailable, exactly as in the app.
  const [activeFilters, setActiveFilters] = useState(initialActiveFilters ?? []);
  const [filterChooserOpen, setFilterChooserOpen] = useState(initialFilterChooserOpen);

  // The app filters server-side; the demo filters its fixtures by
  // the search text so the filtered state is honest about what
  // the app would pass back.
  const visible = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Viewport>
      <DiscoverPage
        title="Discover recipes"
        searchPlaceholder="Search public recipes…"
        emptyMessage="No public recipes match your search."
        errorMessage={errorMessage}
        recipes={visible}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        search={search}
        onSearchChange={setSearch}
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
  render: () => <DiscoverPageDemo />,
};

export const Filtered: Story = {
  render: () => <DiscoverPageDemo initialSearch="chicken" />,
};

export const Empty: Story = {
  render: () => <DiscoverPageDemo initialSearch="quiche" />,
};

export const Loading: Story = {
  render: () => <DiscoverPageDemo isLoading recipes={[]} />,
};

export const ErrorState: Story = {
  // The state the retired web view never rendered: a failed
  // first load shows the app's composed error message as an
  // alert instead of spinning forever.
  render: () => (
    <DiscoverPageDemo
      recipes={[]}
      errorMessage="We couldn't load public recipes. Check your connection and try again."
    />
  ),
};

export const LoadingMore: Story = {
  render: () => <DiscoverPageDemo isFetchingNextPage />,
};

export const FilterChooserOpen: Story = {
  // The #96 chooser state: search + Filters button, with the
  // add-filter options (every filter not yet added) showing.
  render: () => <DiscoverPageDemo initialFilterChooserOpen />,
};

export const WithFiltersAdded: Story = {
  // The #96 added state: only the added filters' controls render
  // (here Ingredient and Sort), each with its Remove control; the
  // remaining filters stay collapsed behind the button.
  render: () => <DiscoverPageDemo initialActiveFilters={["ingredient", "sort"]} />,
};
