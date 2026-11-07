---
component: ListRow
run_when:
  - src/widgets/ListRow.tsx, its stories, MealPlanDetailPage's entries, or a changeset naming ListRow.
---

# ListRow — manual test steps

Colocated manual test steps for `src/widgets/ListRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ListRow

Open in `Widgets/ListRow`: Prefixed, Plain, Disabled.

1. Prefixed: the title line reads "Meal · Taco Tuesday" (the
   prefix is caller-supplied content) in medium weight over the
   muted meta line, with a hairline under the row; the row presses
   (pointer cursor on web, Enter/Space activate).
2. Plain: the title line reads "Garlic cream chicken" with no
   prefix and no meta line.
3. Disabled: the title gains its caller-supplied " (unavailable)"
   suffix; the row does not press, is not focusable, and is
   exposed as disabled.

**Run when:** `src/widgets/ListRow.tsx`, its stories,
MealPlanDetailPage's entries, or a changeset naming ListRow.
