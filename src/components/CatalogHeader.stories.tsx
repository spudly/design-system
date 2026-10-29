import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CatalogFiltersBar, type CatalogFilterDefinition } from "./CatalogFiltersBar.js";
import { CatalogHeader } from "./CatalogHeader.js";
import type { SelectOption } from "./SelectField.js";

const meta: Meta<typeof CatalogHeader> = {
  title: "Components/CatalogHeader",
  component: CatalogHeader,
};

export default meta;
type Story = StoryObj<typeof CatalogHeader>;

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

const noop = () => {};

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const filters: CatalogFilterDefinition[] = [
      {
        kind: "text",
        id: "ingredient",
        label: "Ingredient",
        value: "",
        onChange: noop,
        placeholder: "e.g. chicken",
        defaultValue: "",
      },
      {
        kind: "range",
        id: "calories",
        label: "Calories",
        minLabel: "Min cal",
        maxLabel: "Max cal",
        minValue: "",
        maxValue: "",
        onMinChange: noop,
        onMaxChange: noop,
      },
      {
        kind: "range",
        id: "satiety",
        label: "Satiety",
        minLabel: "Min satiety",
        maxLabel: "Max satiety",
        minValue: "",
        maxValue: "",
        onMinChange: noop,
        onMaxChange: noop,
      },
      {
        kind: "sort",
        id: "sort",
        label: "Sort",
        sortLabel: "Sort by",
        sortOptions: SORT_OPTIONS,
        sortValue: "newest",
        onSortChange: noop,
        defaultSortValue: "newest",
        dirLabel: "Order",
        dirOptions: SORT_DIR_OPTIONS,
        dirValue: "desc",
        onDirChange: noop,
        defaultDirValue: "desc",
      },
    ];
    return (
      <CatalogHeader title="Discover recipes">
        <CatalogFiltersBar
          searchPlaceholder="Search public recipes…"
          search={search}
          onSearchChange={setSearch}
          filters={filters}
        />
      </CatalogHeader>
    );
  },
};
