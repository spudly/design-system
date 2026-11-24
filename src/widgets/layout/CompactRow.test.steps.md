---
component: CompactRow
run_when:
  - "src/widgets/layout/CompactRow.tsx, its stories, or a changeset naming CompactRow."
---

# CompactRow — manual test steps

Colocated manual test steps for `src/widgets/layout/CompactRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CompactRow

Open in `Widgets/CompactRow`: Default.

A row of close actions at the 8px rhythm.

1. The story renders its blocks with the component's own
   rhythm and treatment, matching the loaded views that
   compose it.

**Run when:** `src/widgets/layout/CompactRow.tsx`, its stories, or a
changeset naming CompactRow.
