---
component: ContentStack
run_when:
  - "src/widgets/layout/ContentStack.tsx, its stories, or a changeset naming ContentStack."
---

# ContentStack — manual test steps

Colocated manual test steps for `src/widgets/layout/ContentStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ContentStack

Open in `Widgets/ContentStack`: Default.

A stack of content blocks at the 12px rhythm.

1. The story renders its blocks with the component's own
   rhythm and treatment, matching the loaded views that
   compose it.

**Run when:** `src/widgets/layout/ContentStack.tsx`, its stories, or a
changeset naming ContentStack.
