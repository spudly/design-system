import { useState, type ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { SearchField } from "./SearchField.js";
import { SelectField, type SelectOption } from "./SelectField.js";
import { TextField } from "./TextField.js";

/**
 * The catalog filter bar (#96, #168): the collapsed filter
 * controls the catalog pages share — a search field and a small
 * "Filters" button at rest; a filter's control renders only
 * after it is added from the chooser, and removing a filter
 * clears its values through the ordinary change callbacks so a
 * hidden filter never keeps filtering. Controlled like the
 * pages that render it: filter values in, change callbacks out,
 * the added set and the chooser's openness controlled or
 * internally tracked (seeded from non-default values), exactly
 * the contract RecipesPage's bar carries.
 *
 * Extracted from DiscoverPage for the #119 page de-styling
 * program, unchanged in behavior: the catalog pages compose this
 * bar into their list headers, and the bar owns the filter
 * option sets and labels because they are the bar's vocabulary,
 * not any one page's.
 */

// The filter option sets the app's filter bar hardcodes, moved
// with the bar (the same sets RecipesPage carries). Values stay
// plain strings so no app type leaks into the DS: the app maps
// its own status/sort unions at the boundary.
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

/** The addable filters of the collapsed filter bar (#96). The
 * calorie and satiety ranges each count as one filter (their
 * min/max fields add and remove together), as do the Sort by /
 * Order selects. */
export type CatalogFilterId = "status" | "ingredient" | "calories" | "satiety" | "sort";

const FILTER_LABELS: Record<CatalogFilterId, string> = {
  status: "Status",
  ingredient: "Ingredient",
  calories: "Calories",
  satiety: "Satiety",
  sort: "Sort",
};

const ALL_FILTER_IDS: CatalogFilterId[] = ["status", "ingredient", "calories", "satiety", "sort"];

export type CatalogFiltersBarProps = {
  /** Search field placeholder copy, passed through to the search field. */
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  /** Status filter. The control renders only when both the value
   * and its callback are provided and `showStatusFilter` is not
   * false — the same condition as RecipesPage's bar. */
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
  /** Filters currently added to the bar (#96). Controlled: when
   * provided, the bar renders exactly these filters' controls;
   * when omitted, the bar tracks the added set internally, seeded
   * from the filters carrying non-default values. */
  activeFilters?: CatalogFilterId[];
  /** Fires with the next added set whenever the user adds or
   * removes a filter, in controlled and uncontrolled use alike. */
  onActiveFiltersChange?: (filters: CatalogFilterId[]) => void;
  /** Whether the add-filter chooser is open (#96). Controlled
   * like `activeFilters`; uncontrolled when omitted. */
  filterChooserOpen?: boolean;
  onFilterChooserOpenChange?: (open: boolean) => void;
};

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

/** One added filter: its control(s) plus the Remove control that
 * clears and hides it (#96). */
function AddedFilter({
  id,
  onRemove,
  children,
}: {
  id: CatalogFilterId;
  onRemove: (id: CatalogFilterId) => void;
  children: ReactNode;
}) {
  return (
    <YStack gap={tokens.spacing[1]}>
      <XStack justifyContent="flex-end">
        <Button
          variant="ghost"
          size="sm"
          accessibilityLabel={`Remove ${FILTER_LABELS[id]} filter`}
          onPress={() => {
            onRemove(id);
          }}
        >
          Remove
        </Button>
      </XStack>
      {children}
    </YStack>
  );
}

/** The collapsed filter bar (#96), the same bar RecipesPage
 * renders: search and a small Filters button initially; the
 * button opens a chooser of the filters not yet added, and a
 * filter's control renders only once that filter has been
 * added. The only difference from RecipesPage's bar is the
 * search placeholder, which is a prop here because the two
 * catalogs' copy differs. */
export function CatalogFiltersBar({
  searchPlaceholder,
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
  activeFilters,
  onActiveFiltersChange,
  filterChooserOpen,
  onFilterChooserOpenChange,
}: CatalogFiltersBarProps) {
  const statusAvailable =
    showStatusFilter && statusFilter !== undefined && onStatusFilterChange !== undefined;
  const available = ALL_FILTER_IDS.filter((id) => id !== "status" || statusAvailable);
  // Uncontrolled seed: a filter that already carries a non-default
  // value starts added, so existing callers that preset filter
  // values keep seeing (and can clear) those filters.
  const [internalActiveFilters, setInternalActiveFilters] = useState<CatalogFilterId[]>(() => {
    const seeded: CatalogFilterId[] = [];
    if (statusAvailable && statusFilter !== "all") seeded.push("status");
    if (ingredient !== "") seeded.push("ingredient");
    if (minCalories !== "" || maxCalories !== "") seeded.push("calories");
    if (minSatiety !== "" || maxSatiety !== "") seeded.push("satiety");
    if (sort !== "newest" || sortDir !== "desc") seeded.push("sort");
    return seeded;
  });
  const [internalChooserOpen, setInternalChooserOpen] = useState(false);
  const active = activeFilters ?? internalActiveFilters;
  const chooserOpen = filterChooserOpen ?? internalChooserOpen;
  const addable = available.filter((id) => !active.includes(id));

  const setActive = (next: CatalogFilterId[]) => {
    if (activeFilters === undefined) setInternalActiveFilters(next);
    onActiveFiltersChange?.(next);
  };
  const setChooserOpen = (open: boolean) => {
    if (filterChooserOpen === undefined) setInternalChooserOpen(open);
    onFilterChooserOpenChange?.(open);
  };
  const addFilter = (id: CatalogFilterId) => {
    setActive([...active, id]);
    setChooserOpen(false);
  };
  const removeFilter = (id: CatalogFilterId) => {
    // Removal clears the filter's values through the ordinary
    // change callbacks, so a hidden filter never keeps filtering.
    if (id === "status") onStatusFilterChange?.("all");
    if (id === "ingredient") onIngredientChange("");
    if (id === "calories") {
      onMinCaloriesChange("");
      onMaxCaloriesChange("");
    }
    if (id === "satiety") {
      onMinSatietyChange("");
      onMaxSatietyChange("");
    }
    if (id === "sort") {
      onSortChange("newest");
      onSortDirChange("desc");
    }
    setActive(active.filter((filterId) => filterId !== id));
  };

  return (
    <YStack gap={tokens.spacing[3]}>
      {/* The row stretches its children (#188): the small Filters
          button's natural height is shorter than the SearchField,
          so the button stretches to the search field's height and
          the two line up. Do not switch this back to flex-start —
          that is what made the button shorter than the field. */}
      <XStack gap={tokens.spacing[2]} alignItems="stretch">
        <YStack flex={1}>
          <SearchField
            value={search}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </YStack>
        {addable.length > 0 ? (
          <Button
            variant="secondary"
            size="sm"
            accessibilityLabel="Add a filter"
            aria-expanded={chooserOpen}
            onPress={() => {
              setChooserOpen(!chooserOpen);
            }}
          >
            Filters
          </Button>
        ) : null}
      </XStack>
      {chooserOpen && addable.length > 0 ? (
        <XStack gap={tokens.spacing[2]} flexWrap="wrap">
          {addable.map((id) => (
            <Button
              key={id}
              variant="secondary"
              size="sm"
              accessibilityLabel={`Add ${FILTER_LABELS[id]} filter`}
              onPress={() => {
                addFilter(id);
              }}
            >
              {FILTER_LABELS[id]}
            </Button>
          ))}
        </XStack>
      ) : null}
      {active.includes("status") && statusAvailable ? (
        <AddedFilter id="status" onRemove={removeFilter}>
          <SelectField
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onValueChange={onStatusFilterChange}
          />
        </AddedFilter>
      ) : null}
      {active.includes("ingredient") ? (
        <AddedFilter id="ingredient" onRemove={removeFilter}>
          <TextField
            label="Ingredient"
            accessibilityLabel="Ingredient"
            value={ingredient}
            onChangeText={onIngredientChange}
            placeholder="e.g. chicken"
          />
        </AddedFilter>
      ) : null}
      {active.includes("calories") ? (
        <AddedFilter id="calories" onRemove={removeFilter}>
          <XStack gap={tokens.spacing[2]}>
            <NumberFilter label="Min cal" value={minCalories} onChange={onMinCaloriesChange} />
            <NumberFilter label="Max cal" value={maxCalories} onChange={onMaxCaloriesChange} />
          </XStack>
        </AddedFilter>
      ) : null}
      {active.includes("satiety") ? (
        <AddedFilter id="satiety" onRemove={removeFilter}>
          <XStack gap={tokens.spacing[2]}>
            <NumberFilter label="Min satiety" value={minSatiety} onChange={onMinSatietyChange} />
            <NumberFilter label="Max satiety" value={maxSatiety} onChange={onMaxSatietyChange} />
          </XStack>
        </AddedFilter>
      ) : null}
      {active.includes("sort") ? (
        <AddedFilter id="sort" onRemove={removeFilter}>
          <YStack gap={tokens.spacing[3]}>
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
        </AddedFilter>
      ) : null}
    </YStack>
  );
}
