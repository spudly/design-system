---
component: StatBand
run_when:
  - src/widgets/StatBand.tsx, its stories, the recipe detail pages' stat band, or a changeset naming StatBand.
---

# StatBand — manual test steps

Colocated manual test steps for `src/widgets/StatBand.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## StatBand

Open in `Widgets/StatBand`: Default, TwoStats.

1. Default: Servings, Prep, and Cook stat cards spread evenly
   across a recessed light-gray band with large rounded corners
   and vertical padding; the band itself has no margin.
2. TwoStats: the two cards spread to the band's ends with the
   same fill and padding.

**Run when:** `src/widgets/StatBand.tsx`, its stories, the
recipe detail pages' stat band, or a changeset naming StatBand.
