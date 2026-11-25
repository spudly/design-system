---
component: LoadingListItem
run_when:
  - "src/widgets/feedback/LoadingListItem.tsx, its stories, the pages that compose LoadingListItem (ShoppingListPage), or a changeset naming LoadingListItem."
---

# LoadingListItem — manual test steps

Colocated manual test steps for `src/widgets/feedback/LoadingListItem.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LoadingListItem

Open in `Widgets/LoadingListItem`: Default.

A LoadingListItem is a check list's loading row: a 24px box bone
beside a medium text bone.

1. The three rows render as a 24px box bone beside a medium text
   bone, top-aligned with 12px gaps and 12px vertical padding
   (ShoppingListPage's loading list is the live case), and the
   bones mirror the loaded CheckboxField list row's checkbox and label sizes.

**Run when:** `src/widgets/feedback/LoadingListItem.tsx`, its stories,
the pages that compose LoadingListItem (ShoppingListPage), or a
changeset naming LoadingListItem.
