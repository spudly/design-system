---
component: CompactStack
run_when:
  - "src/widgets/layout/CompactStack.tsx, its stories, or a changeset naming CompactStack."
---

# CompactStack — manual test steps

Colocated manual test steps for `src/widgets/layout/CompactStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CompactStack

Open in `Widgets/CompactStack`: Default.

A stack of close blocks at the 8px rhythm.

1. The story renders its blocks with the component's own
   rhythm and treatment, matching the loaded views that
   compose it.

**Run when:** `src/widgets/layout/CompactStack.tsx`, its stories, or a
changeset naming CompactStack.
