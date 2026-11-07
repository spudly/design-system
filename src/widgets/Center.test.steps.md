---
component: Center
run_when:
  - src/widgets/Center.tsx, its stories, the pages that compose Center (MealPlansPage), or a changeset naming Center.
---

# Center — manual test steps

Colocated manual test steps for `src/widgets/Center.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Center

Open in `Widgets/Center`: Centered, HorizontalOnly.

Center centers a single child; `horizontal` and `vertical` are
booleans, both defaulting to true. `fill` is the semantic
full-area form (the Center grows to the height its parent
offers) — the detail pages' loading states use it, so their
spinner centers in the shell's content area.

1. Centered: the spinner sits at the center of the framed
   block, both dimensions on. Toggle `vertical` off in the
   controls: the spinner moves to the top, still centered
   horizontally; toggle `horizontal` off instead: it moves to
   the left edge, still centered vertically.
2. HorizontalOnly: the notice sits at the top of its block,
   centered horizontally (MealPlansPage's loading block is the
   live page case — the spinner centered under the heading and
   create button).

**Run when:** `src/widgets/Center.tsx`, its stories, the
pages that compose Center (MealPlansPage), or a changeset
naming Center.
