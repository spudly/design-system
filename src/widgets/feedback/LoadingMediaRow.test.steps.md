---
component: LoadingMediaRow
run_when:
  - "src/widgets/feedback/LoadingMediaRow.tsx, its stories, the pages that compose LoadingMediaRow (RecipesPage), or a changeset naming LoadingMediaRow."
---

# LoadingMediaRow — manual test steps

Colocated manual test steps for `src/widgets/feedback/LoadingMediaRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LoadingMediaRow

Open in `Widgets/LoadingMediaRow`: Default.

A LoadingMediaRow is a media list's loading row: an elevated
card with a 64dp box bone beside title/subtitle bones, in the
loaded media row's shape.

1. The three rows render as elevated cards with a square bone
   beside a medium bone over a small bone inside each,
   separated by 12px below each card (RecipesPage's loading own
   section is the live case), and the bones mirror the loaded
   media rows' geometry.

**Run when:** `src/widgets/feedback/LoadingMediaRow.tsx`, its stories,
the pages that compose LoadingMediaRow (RecipesPage), or a
changeset naming LoadingMediaRow.
