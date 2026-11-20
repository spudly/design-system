---
component: LoadingListRow
run_when:
  - "src/widgets/LoadingListRow.tsx, its stories, the pages that compose LoadingListRow (ShoppingListPage), or a changeset naming LoadingListRow."
---

# LoadingListRow — manual test steps

Colocated manual test steps for `src/widgets/LoadingListRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LoadingListRow

Open in `Widgets/LoadingListRow`: Default.

A LoadingListRow is a check list's loading row: a 24px box bone
beside a medium text bone.

1. The three rows render as a 24px box bone beside a medium text
   bone, top-aligned with 12px gaps and 12px vertical padding
   (ShoppingListPage's loading list is the live case), and the
   bones mirror the loaded CheckboxField list row's checkbox and label sizes.

**Run when:** `src/widgets/LoadingListRow.tsx`, its stories,
the pages that compose LoadingListRow (ShoppingListPage), or a
changeset naming LoadingListRow.
