---
component: CardGrid
run_when:
  - "src/widgets/CardGrid.tsx, its stories, the pages that compose CardGrid (LandingPage), or a changeset naming CardGrid."
---

# CardGrid — manual test steps

Colocated manual test steps for `src/widgets/CardGrid.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CardGrid

Open in `Widgets/CardGrid`: Default.

A CardGrid is a wrapping grid of cards that sizes its own cards.

1. The three cards wrap with a 12px gap, each growing from a 260px basis to share its row, with an 8px gap between each card's title and description (LandingPage's feature grid is the live case).

**Run when:** `src/widgets/CardGrid.tsx`, its stories,
the pages that compose CardGrid (LandingPage), or a changeset
naming CardGrid.
