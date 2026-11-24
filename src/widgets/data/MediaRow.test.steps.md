---
component: MediaRow
run_when:
  - "src/widgets/data/MediaRow.tsx, its stories, the pages that compose MediaRow (RecipesPage and HomePage through recipeRow), or a changeset naming MediaRow."
---

# MediaRow — manual test steps

Colocated manual test steps for `src/widgets/data/MediaRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## MediaRow

Open in `Widgets/MediaRow`: Default.

A MediaRow is a media list's loaded row: an elevated card with a
64dp thumbnail (or placeholder well), title, subtitle, and an
optional badge, where both the media and the text are links to
the row's href.

1. Each row renders as an elevated card with the thumbnail well
   beside the title over the subtitle, separated by 12px below
   each card (RecipesPage's own section and HomePage's
   recently-viewed list are the live cases), matching the loaded
   rows' geometry from before the #119 tranche-4 extraction.
2. The badged row shows its badge under the subtitle.

**Run when:** `src/widgets/data/MediaRow.tsx`, its stories,
the pages that compose MediaRow (RecipesPage and HomePage through recipeRow), or a
changeset naming MediaRow.
