import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CatalogFiltersBar, type CatalogFilterDefinition } from "./CatalogFiltersBar.js";
import type { SelectOption } from "../../widgets/form/SelectField.js";

const meta: Meta<typeof CatalogFiltersBar> = {
  title: "Views/Eciperay/CatalogFiltersBar",
  component: CatalogFiltersBar,
};

export default meta;
type Story = StoryObj<typeof CatalogFiltersBar>;

// The story's catalog data: the bar takes its filter
// definitions in, so the demo supplies the option sets the way
// a catalog page does.
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

/** The bar is controlled: the story holds the filter state the
 * way a catalog page's host does, and passes the catalog's
 * filter definitions in. */
const SEARCH_HELP = {
  label: "Search syntax",
  title: "Search syntax",
  intro: "Combine these in the search field to narrow results.",
  entries: [
    { syntax: "title:", description: "Match words in the title, e.g. title:soup." },
    { syntax: "desc:", description: "Match words in the description." },
    { syntax: "ingredient:", description: "Match recipes using an ingredient." },
    { syntax: "tag:", description: "Match a tag." },
    { syntax: '"quoted phrase"', description: "Match the exact phrase." },
    { syntax: "-ingredient:", description: "Exclude recipes using an ingredient." },
    { syntax: "status: / is:", description: "Filter by status, e.g. is:favorite." },
    { syntax: "calories:<600", description: "Match under a calorie limit." },
  ],
};

const SEARCH_HINT = "Tip: try title:soup or calories:<600 — open Search syntax for all qualifiers.";

function BarDemo({
  initialActive,
  initialChooserOpen = false,
  withSearchHelp = false,
  loading = false,
}: {
  initialActive?: string[];
  initialChooserOpen?: boolean;
  withSearchHelp?: boolean;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minSatiety, setMinSatiety] = useState("");
  const [maxSatiety, setMaxSatiety] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortDir, setSortDir] = useState("desc");
  const [activeFilters, setActiveFilters] = useState<string[]>(initialActive ?? []);
  const [chooserOpen, setChooserOpen] = useState(initialChooserOpen);
  const filters: CatalogFilterDefinition[] = [
    {
      kind: "text",
      id: "ingredient",
      label: "Ingredient",
      value: ingredient,
      onChange: setIngredient,
      placeholder: "e.g. chicken",
      defaultValue: "",
    },
    {
      kind: "range",
      id: "calories",
      label: "Calories",
      minLabel: "Min cal",
      maxLabel: "Max cal",
      minValue: minCalories,
      maxValue: maxCalories,
      onMinChange: setMinCalories,
      onMaxChange: setMaxCalories,
    },
    {
      kind: "range",
      id: "satiety",
      label: "Satiety",
      minLabel: "Min satiety",
      maxLabel: "Max satiety",
      minValue: minSatiety,
      maxValue: maxSatiety,
      onMinChange: setMinSatiety,
      onMaxChange: setMaxSatiety,
    },
    {
      kind: "sort",
      id: "sort",
      label: "Sort",
      sortLabel: "Sort by",
      sortOptions: SORT_OPTIONS,
      sortValue: sort,
      onSortChange: setSort,
      defaultSortValue: "newest",
      dirLabel: "Order",
      dirOptions: SORT_DIR_OPTIONS,
      dirValue: sortDir,
      onDirChange: setSortDir,
      defaultDirValue: "desc",
    },
  ];
  return (
    <CatalogFiltersBar
      searchPlaceholder="Search public recipes…"
      search={search}
      onSearchChange={setSearch}
      {...(withSearchHelp ? { searchHelp: SEARCH_HELP, searchHint: SEARCH_HINT } : {})}
      filters={filters}
      activeFilters={activeFilters}
      onActiveFiltersChange={setActiveFilters}
      filterChooserOpen={chooserOpen}
      onFilterChooserOpenChange={setChooserOpen}
      loading={loading}
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

export const WithSearchHelp: Story = {
  render: () => <BarDemo withSearchHelp />,
};

/** The loading state (#874): the search row as bones — the
 * search field's box and the Filters button's box — while the
 * catalog's filter definitions are still resolving. */
export const Loading: Story = {
  render: () => <BarDemo loading />,
};
