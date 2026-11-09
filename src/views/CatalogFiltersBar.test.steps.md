---
component: CatalogFiltersBar
run_when:
  - "src/views/CatalogFiltersBar.tsx, src/views/CatalogHeader.tsx, their stories, the catalog pages, or a changeset naming either. (namely: CatalogFiltersBar, CatalogHeader, RecipesPage, DiscoverPage)"
---

# CatalogFiltersBar — manual test steps

Colocated manual test steps for `src/views/CatalogFiltersBar.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CatalogFiltersBar & CatalogHeader

Open in `Views/CatalogFiltersBar`: Collapsed, ChooserOpen,
WithFiltersAdded; and `Views/CatalogHeader`: Default.

1. Collapsed: a search field and a Filters button — nothing
   else. The search starts empty, so there is no clear button
   yet: type into the field and the clear button appears. There is no sorter row or
   result count line: sorting is one of the filter definitions
   (Sort), rendered only once added, and the bar has no result
   count. Nothing about the filter set is built in —
   `BarDemo` defines the filters in its own body and the
   story's render function ignores Storybook args, so
   changing args or controls does not change the filters.
2. ChooserOpen: the filter chooser lists the passed-in filter
   definitions by name (the demo's Ingredient, Calories,
   Satiety, and Sort); a definition's controls render only
   after it is added, not in the chooser list itself.
3. WithFiltersAdded: each added filter renders as a removable
   row naming its filter; its remove button visibly reads
   "Remove" and its accessible name is `Remove <label>
filter`; removing it returns the row to the chooser.
4. CatalogHeader Default: the title renders as the heading
   above the composed bar, left-aligned at the column inset.

**Run when:** `src/views/CatalogFiltersBar.tsx`,
`src/views/CatalogHeader.tsx`, their stories, the catalog
pages, or a changeset naming either.
