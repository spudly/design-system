import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CatalogFiltersBar } from "./CatalogFiltersBar.js";
import { CatalogHeader } from "./CatalogHeader.js";

const meta: Meta<typeof CatalogHeader> = {
  title: "Components/CatalogHeader",
  component: CatalogHeader,
};

export default meta;
type Story = StoryObj<typeof CatalogHeader>;

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <CatalogHeader title="Discover recipes">
        <CatalogFiltersBar
          searchPlaceholder="Search public recipes…"
          search={search}
          onSearchChange={setSearch}
          ingredient=""
          onIngredientChange={() => {}}
          minCalories=""
          onMinCaloriesChange={() => {}}
          maxCalories=""
          onMaxCaloriesChange={() => {}}
          minSatiety=""
          onMinSatietyChange={() => {}}
          maxSatiety=""
          onMaxSatietyChange={() => {}}
          sort="newest"
          onSortChange={() => {}}
          sortDir="desc"
          onSortDirChange={() => {}}
        />
      </CatalogHeader>
    );
  },
};
