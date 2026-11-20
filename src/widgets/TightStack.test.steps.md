---
component: TightStack
run_when:
  - "src/widgets/TightStack.tsx, its stories, or a changeset naming TightStack."
---

# TightStack — manual test steps

Colocated manual test steps for `src/widgets/TightStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## TightStack

Open in `Widgets/TightStack`: Default.

A stack of tight lines at the 4px rhythm.

1. The story renders its blocks with the component's own
   rhythm and treatment, matching the loaded views that
   compose it.

**Run when:** `src/widgets/TightStack.tsx`, its stories, or a
changeset naming TightStack.
