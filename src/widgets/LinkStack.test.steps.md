---
component: LinkStack
run_when:
  - "src/widgets/LinkStack.tsx, its stories, the pages that compose LinkStack (ProfilePage), or a changeset naming LinkStack."
---

# LinkStack — manual test steps

Colocated manual test steps for `src/widgets/LinkStack.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LinkStack

Open in `Widgets/LinkStack`: Default.

A LinkStack is a stack of text links listed one per line.

1. The three links stack with an even 8px gap between them,
   each left-aligned and tappable (ProfilePage's Legal section
   is the live case).

**Run when:** `src/widgets/LinkStack.tsx`, its stories, the
pages that compose LinkStack (ProfilePage), or a changeset
naming LinkStack.
