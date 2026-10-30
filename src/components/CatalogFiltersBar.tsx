import { useState } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { RemovableField } from "./RemovableField.js";
import { SearchField } from "./SearchField.js";
import { SearchRow } from "./SearchRow.js";
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
 * The bar owns the filter CONTROL DESIGN — the four control
 * shapes (select, text, number range, sort pair), the chooser,
 * the add/remove rhythm — and nothing else: which filters
 * exist, their labels, their option sets, and their defaults
 * are the caller's DATA, passed in as filter definitions
 * (Stephen's ruling on PR #311: the bar must not hardcode one
 * app's filter/sorter lists; the DS extraction reusability rule
 * — no single app's domain data baked into a shared component).
 * Extracted from DiscoverPage for the #119 page de-styling
 * program, unchanged in behavior: the catalog pages compose
 * this bar into their list headers and pass their catalog's
 * definitions in.
 */

/** A single-select filter: a SelectField over caller-supplied
 * options. Removal (and the uncontrolled seed) keys off
 * `defaultValue`: the filter starts added iff its value differs
 * from the default, and removal resets it to the default. */
export type CatalogSelectFilter<FilterId extends string = string> = {
  kind: "select";
  id: FilterId;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  defaultValue: string;
};

/** A free-text filter: a TextField. Defaults work like the
 * select's. */
export type CatalogTextFilter<FilterId extends string = string> = {
  kind: "text";
  id: FilterId;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultValue: string;
};

/** A numeric range filter: the min/max TextFields add and
 * remove together (one filter, #96). The range's default is
 * empty on both ends: it starts added iff either end is set,
 * and removal clears both. */
export type CatalogRangeFilter<FilterId extends string = string> = {
  kind: "range";
  id: FilterId;
  label: string;
  minLabel: string;
  maxLabel: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
};

/** The sort filter: the Sort-by and Order SelectFields as one
 * filter (#96). Starts added iff either value differs from its
 * default; removal resets both. */
export type CatalogSortFilter<FilterId extends string = string> = {
  kind: "sort";
  id: FilterId;
  label: string;
  sortLabel: string;
  sortOptions: SelectOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  defaultSortValue: string;
  dirLabel: string;
  dirOptions: SelectOption[];
  dirValue: string;
  onDirChange: (value: string) => void;
  defaultDirValue: string;
};

/** One addable filter of the collapsed filter bar (#96), as
 * caller-supplied data: its id, its label, and the control
 * shape (by `kind`) with the values and callbacks the control
 * binds to. */
export type CatalogFilterDefinition<FilterId extends string = string> =
  | CatalogSelectFilter<FilterId>
  | CatalogTextFilter<FilterId>
  | CatalogRangeFilter<FilterId>
  | CatalogSortFilter<FilterId>;

export type CatalogFiltersBarProps<FilterId extends string = string> = {
  /** Search field placeholder copy, passed through to the search field. */
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  /** The addable filters, in chooser order — the caller's data
   * (see the file header): the bar renders a control for a
   * definition only once its filter has been added. */
  filters: CatalogFilterDefinition<FilterId>[];
  /** Filters currently added to the bar (#96). Controlled: when
   * provided, the bar renders exactly these filters' controls;
   * when omitted, the bar tracks the added set internally, seeded
   * from the filters carrying non-default values. */
  activeFilters?: FilterId[];
  /** Fires with the next added set whenever the user adds or
   * removes a filter, in controlled and uncontrolled use alike. */
  onActiveFiltersChange?: (filters: FilterId[]) => void;
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
    <TextField
      grow
      label={label}
      accessibilityLabel={label}
      keyboardType="numeric"
      value={value}
      onChangeText={onChange}
    />
  );
}

/** Whether a filter carries a non-default value — the
 * uncontrolled seed condition (a preset filter starts added so
 * existing callers keep seeing, and can clear, it). */
function isNonDefault<FilterId extends string>(definition: CatalogFilterDefinition<FilterId>) {
  switch (definition.kind) {
    case "select":
    case "text":
      return definition.value !== definition.defaultValue;
    case "range":
      return definition.minValue !== "" || definition.maxValue !== "";
    case "sort":
      return (
        definition.sortValue !== definition.defaultSortValue ||
        definition.dirValue !== definition.defaultDirValue
      );
  }
}

/** Removal clears the filter's values through its ordinary
 * change callbacks, so a hidden filter never keeps filtering. */
function clearFilter<FilterId extends string>(definition: CatalogFilterDefinition<FilterId>) {
  switch (definition.kind) {
    case "select":
    case "text":
      definition.onChange(definition.defaultValue);
      break;
    case "range":
      definition.onMinChange("");
      definition.onMaxChange("");
      break;
    case "sort":
      definition.onSortChange(definition.defaultSortValue);
      definition.onDirChange(definition.defaultDirValue);
      break;
  }
}

/** One filter definition's control(s), by shape. */
function FilterControl<FilterId extends string>({
  definition,
}: {
  definition: CatalogFilterDefinition<FilterId>;
}) {
  switch (definition.kind) {
    case "select":
      return (
        <SelectField
          label={definition.label}
          value={definition.value}
          options={definition.options}
          onValueChange={definition.onChange}
        />
      );
    case "text":
      return (
        <TextField
          label={definition.label}
          accessibilityLabel={definition.label}
          value={definition.value}
          onChangeText={definition.onChange}
          {...(definition.placeholder !== undefined ? { placeholder: definition.placeholder } : {})}
        />
      );
    case "range":
      return (
        <XStack gap={tokens.spacing[2]}>
          <NumberFilter
            label={definition.minLabel}
            value={definition.minValue}
            onChange={definition.onMinChange}
          />
          <NumberFilter
            label={definition.maxLabel}
            value={definition.maxValue}
            onChange={definition.onMaxChange}
          />
        </XStack>
      );
    case "sort":
      return (
        <YStack gap={tokens.spacing[3]}>
          <SelectField
            label={definition.sortLabel}
            value={definition.sortValue}
            options={definition.sortOptions}
            onValueChange={definition.onSortChange}
          />
          <SelectField
            label={definition.dirLabel}
            value={definition.dirValue}
            options={definition.dirOptions}
            onValueChange={definition.onDirChange}
          />
        </YStack>
      );
  }
}

/** The collapsed filter bar (#96), the same bar RecipesPage
 * renders: search and a small Filters button initially; the
 * button opens a chooser of the filters not yet added, and a
 * filter's control renders only once that filter has been
 * added. The search placeholder and the filter definitions are
 * props because the catalogs' copy and data differ. The bar
 * composes the shared primitives for its rows: SearchRow for
 * the search row and RemovableField for each added filter —
 * the two catalogs' bars had converged on those exact shapes
 * independently before this component unified them (#119
 * dedupe). */
export function CatalogFiltersBar<FilterId extends string = string>({
  searchPlaceholder,
  search,
  onSearchChange,
  filters,
  activeFilters,
  onActiveFiltersChange,
  filterChooserOpen,
  onFilterChooserOpenChange,
}: CatalogFiltersBarProps<FilterId>) {
  // Uncontrolled seed: a filter that already carries a non-default
  // value starts added, so existing callers that preset filter
  // values keep seeing (and can clear) those filters.
  const [internalActiveFilters, setInternalActiveFilters] = useState<FilterId[]>(() =>
    filters.filter(isNonDefault).map((definition) => definition.id),
  );
  const [internalChooserOpen, setInternalChooserOpen] = useState(false);
  const active = activeFilters ?? internalActiveFilters;
  const chooserOpen = filterChooserOpen ?? internalChooserOpen;
  const addable = filters.filter((definition) => !active.includes(definition.id));
  const added = filters.filter((definition) => active.includes(definition.id));

  const setActive = (next: FilterId[]) => {
    if (activeFilters === undefined) setInternalActiveFilters(next);
    onActiveFiltersChange?.(next);
  };
  const setChooserOpen = (open: boolean) => {
    if (filterChooserOpen === undefined) setInternalChooserOpen(open);
    onFilterChooserOpenChange?.(open);
  };
  const addFilter = (id: FilterId) => {
    setActive([...active, id]);
    setChooserOpen(false);
  };
  const removeFilter = (definition: CatalogFilterDefinition<FilterId>) => {
    clearFilter(definition);
    setActive(active.filter((filterId) => filterId !== definition.id));
  };

  return (
    <YStack gap={tokens.spacing[3]}>
      {/* SearchRow stretches its children (#188): the small
          Filters button's natural height is shorter than the
          SearchField, so the button stretches to the search
          field's height and the two line up. Do not switch this
          back to flex-start — that is what made the button
          shorter than the field. */}
      <SearchRow>
        <SearchField
          grow
          value={search}
          onChangeText={onSearchChange}
          placeholder={searchPlaceholder}
        />
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
      </SearchRow>
      {chooserOpen && addable.length > 0 ? (
        <XStack gap={tokens.spacing[2]} flexWrap="wrap">
          {addable.map((definition) => (
            <Button
              key={definition.id}
              variant="secondary"
              size="sm"
              accessibilityLabel={`Add ${definition.label} filter`}
              onPress={() => {
                addFilter(definition.id);
              }}
            >
              {definition.label}
            </Button>
          ))}
        </XStack>
      ) : null}
      {added.map((definition) => (
        <RemovableField
          key={definition.id}
          removeAccessibilityLabel={`Remove ${definition.label} filter`}
          onRemove={() => {
            removeFilter(definition);
          }}
        >
          <FilterControl definition={definition} />
        </RemovableField>
      ))}
    </YStack>
  );
}
