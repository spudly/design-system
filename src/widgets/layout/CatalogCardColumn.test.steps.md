---
component: CatalogCardColumn
run_when:
  - "src/widgets/layout/CatalogCardColumn.tsx, its stories, the pages that compose CatalogCardColumn (RecipesPage), or a changeset naming CatalogCardColumn."
---

# CatalogCardColumn — manual test steps

Colocated manual test steps for `src/widgets/layout/CatalogCardColumn.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CatalogCardColumn

Open in `Widgets/CatalogCardColumn`: Default.

A CatalogCardColumn is the public catalog's web column: the
standard page inset with a 12px gap between bare cards.

1. The cards render inset 16px at the sides and 32px at the
   bottom, separated by 12px gaps (RecipesPage's public variant
   on web is the live case).

**Run when:** `src/widgets/layout/CatalogCardColumn.tsx`, its stories,
the pages that compose CatalogCardColumn (RecipesPage), or a
changeset naming CatalogCardColumn.
