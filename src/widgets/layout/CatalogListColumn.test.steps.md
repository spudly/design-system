---
component: CatalogListColumn
run_when:
  - "src/widgets/layout/CatalogListColumn.tsx, its stories, the pages that compose CatalogListColumn (RecipesPage), or a changeset naming CatalogListColumn."
---

# CatalogListColumn — manual test steps

Colocated manual test steps for `src/widgets/layout/CatalogListColumn.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CatalogListColumn

Open in `Widgets/CatalogListColumn`: Default.

A CatalogListColumn is the signed-in catalog's web column: the
standard page inset, with rows carrying their own separation.

1. The rows render inset 16px at the sides and 32px at the
   bottom, separated only by each CatalogRow's own 12px bottom
   space — no extra column gap (RecipesPage's signed-in variant
   on web is the live case).

**Run when:** `src/widgets/layout/CatalogListColumn.tsx`, its stories,
the pages that compose CatalogListColumn (RecipesPage), or a
changeset naming CatalogListColumn.
