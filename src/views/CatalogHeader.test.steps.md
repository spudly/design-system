---
component: CatalogHeader
run_when:
  - "src/views/CatalogFiltersBar.tsx, src/views/CatalogHeader.tsx, their stories, the catalog pages, or a changeset naming either. (namely: CatalogFiltersBar, CatalogHeader, RecipesPage, DiscoverPage)"
---

# CatalogHeader — manual test steps

Colocated manual test steps for `src/views/CatalogHeader.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CatalogFiltersBar & CatalogHeader

Open in `Views/CatalogFiltersBar`: Collapsed, ChooserOpen,
WithFiltersAdded; and `Views/CatalogHeader`: Default.

1. Collapsed: a search field with its clear button and a
   Filters button; below them the caller-supplied sorter row
   and the result count line. Nothing about the filter set is
   built in — the story's filters come from its args.
2. ChooserOpen: the filter chooser lists the passed-in filter
   definitions with their controls (the demo's tag, status,
   numeric, and availability shapes).
3. WithFiltersAdded: each added filter renders as a removable
   row naming its filter; its remove button reads "Remove
   <label> filter" and removing it returns the row to the
   chooser.
4. CatalogHeader Default: the title renders as the heading
   above the composed bar, left-aligned at the column inset.

**Run when:** `src/views/CatalogFiltersBar.tsx`,
`src/views/CatalogHeader.tsx`, their stories, the catalog
pages, or a changeset naming either.
