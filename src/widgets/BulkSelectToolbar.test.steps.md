---
component: BulkSelectToolbar
run_when:
  - src/widgets/BulkSelectToolbar.tsx, its stories, or a changeset naming BulkSelectToolbar.
---

# BulkSelectToolbar — manual test steps

Colocated manual test steps for `src/widgets/BulkSelectToolbar.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## BulkSelectToolbar

Open in `Widgets/BulkSelectToolbar`: Default, NothingFiltered.

1. The selection count sits **on the same visual center line as the
   action buttons** beside it — not raised, dropped, or offset.
2. NothingFiltered renders the toolbar in its nothing-filtered state
   with no stray count or disabled-looking actions.
3. Buttons remain legible and tappable-looking at the story's default
   size; nothing overlaps the count text.

**Run when:** `src/widgets/BulkSelectToolbar.tsx`, its stories, or
a changeset naming BulkSelectToolbar.
