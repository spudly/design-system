import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { SharedWithMePage, type SharedWithMePageItem } from "./SharedWithMePage.js";

/**
 * Stories for the real SharedWithMePage component (#49) — not a
 * made-up page composition: this renders the same component the
 * Eciperay app will consume, driven by fixture props. It succeeds
 * the Shared-with-me demo in Pages/Eciperay (#44) as this screen's
 * snapshot spec; where the two disagree (the demo's heading,
 * avatars, and "Shared by" lines, and its missing filter bar),
 * this component — which mirrors the real app screen — wins.
 *
 * The frame matches RecipesPage's stories: a fixed phone viewport
 * (430×844), because a real FlatList needs a bounded viewport to
 * virtualize against — an unbounded one is also exactly the #188
 * failure shape — and fixed dimensions keep Chromatic screenshots
 * deterministic. Theme pinned to Warm Harvest, Eciperay's brand,
 * like Pages/Eciperay.
 */
const meta: Meta<typeof SharedWithMePage> = {
  title: "Pages/Eciperay/SharedWithMePage",
  component: SharedWithMePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof SharedWithMePage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

// Subtitles in the app's list-meta shape (servings · time ·
// satiety), formatted app-side in the real screen; here they are
// fixture literals on the view-model items.
const sharedItems: SharedWithMePageItem[] = [
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

function SharedWithMePageDemo({
  initialSearch = "",
  recipes = sharedItems,
  isLoading = false,
}: {
  initialSearch?: string;
  recipes?: SharedWithMePageItem[];
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
      <SharedWithMePage
        recipes={visible}
        isLoading={isLoading}
        onRecipePress={() => undefined}
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

export const Default: Story = {
  render: () => <SharedWithMePageDemo />,
};

export const Filtered: Story = {
  render: () => <SharedWithMePageDemo initialSearch="chicken" />,
};

export const Empty: Story = {
  render: () => <SharedWithMePageDemo initialSearch="quiche" />,
};

export const Loading: Story = {
  render: () => <SharedWithMePageDemo isLoading recipes={[]} />,
};
