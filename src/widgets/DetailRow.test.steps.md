---
component: DetailRow
run_when:
  - "src/widgets/DetailRow.tsx, its stories, MealPlanDetailPage (the nutrition-goal rows), or a changeset naming DetailRow."
---

# DetailRow — manual test steps

Colocated manual test steps for `src/widgets/DetailRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## DetailRow

Open in `Widgets/DetailRow`: Default, Stacked.

1. Default: the muted label sits on the left edge and the value on
   the right edge of the same line, over a light hairline.
2. Stacked: three rows share the same hairline rhythm — labels
   aligned left, values aligned right, even vertical padding on
   every row.

**Run when:** `src/widgets/DetailRow.tsx`, its stories,
MealPlanDetailPage (the nutrition-goal rows), or a changeset
naming DetailRow.
