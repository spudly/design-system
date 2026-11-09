---
component: ListStack
run_when:
  - "src/widgets/ListStack.tsx, its stories, the pages that compose ListStack (MealPlanDetailPage, MealDetailPage), or a changeset naming ListStack."
---

# ListStack — manual test steps

Colocated manual test steps for `src/widgets/ListStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ListStack

Open in `Widgets/ListStack`: Default.

A ListStack composes hairline rows as one continuous list; the
stack adds no gap of its own — the rows own their separation.

1. The three rows read as one ruled surface: hairlines run
   continuously from row to row with no gaps of card background
   between them, and the third row shows the disabled treatment
   (MealPlanDetailPage's Entries card and MealDetailPage's
   Recipes card are the live cases).

**Run when:** `src/widgets/ListStack.tsx`, its stories, the
pages that compose ListStack (MealPlanDetailPage,
MealDetailPage), or a changeset naming ListStack.
