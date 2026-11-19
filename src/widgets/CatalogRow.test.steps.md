---
component: CatalogRow
run_when:
  - "src/widgets/CatalogRow.tsx, its stories, the pages that compose CatalogRow (RecipesPage), or a changeset naming CatalogRow."
---

# CatalogRow — manual test steps

Colocated manual test steps for `src/widgets/CatalogRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CatalogRow

Open in `Widgets/CatalogRow`: Default.

A CatalogRow is one catalog row's separation: the row's content
with 12px of space under it.

1. Each row's content renders with 12px of space below it
   (RecipesPage's section headings, discovery cards, and filter
   header are the live cases), matching the catalog lists'
   loaded rhythm.

**Run when:** `src/widgets/CatalogRow.tsx`, its stories,
the pages that compose CatalogRow (RecipesPage), or a
changeset naming CatalogRow.
