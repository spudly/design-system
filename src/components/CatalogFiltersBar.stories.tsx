import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CatalogFiltersBar, type CatalogFilterId } from "./CatalogFiltersBar.js";

const meta: Meta<typeof CatalogFiltersBar> = {
  title: "Components/CatalogFiltersBar",
  component: CatalogFiltersBar,
};

export default meta;
type Story = StoryObj<typeof CatalogFiltersBar>;

/** The bar is controlled: the story holds the filter state the
 * way a catalog page's host does. */
function BarDemo({
  initialActive,
  initialChooserOpen = false,
}: {
  initialActive?: CatalogFilterId[];
  initialChooserOpen?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minSatiety, setMinSatiety] = useState("");
  const [maxSatiety, setMaxSatiety] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortDir, setSortDir] = useState("desc");
  const [activeFilters, setActiveFilters] = useState<CatalogFilterId[]>(initialActive ?? []);
  const [chooserOpen, setChooserOpen] = useState(initialChooserOpen);
  return (
    <CatalogFiltersBar
      searchPlaceholder="Search public recipes…"
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
      filterChooserOpen={chooserOpen}
      onFilterChooserOpenChange={setChooserOpen}
    />
  );
}

export const Collapsed: Story = {
  render: () => <BarDemo />,
};

export const ChooserOpen: Story = {
  render: () => <BarDemo initialChooserOpen />,
};

export const WithFiltersAdded: Story = {
  render: () => <BarDemo initialActive={["ingredient", "calories", "sort"]} />,
};
