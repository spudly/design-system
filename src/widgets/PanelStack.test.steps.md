---
component: PanelStack
run_when:
  - src/widgets/PanelStack.tsx, its stories, a detail page composing it, or a changeset naming PanelStack.
---

# PanelStack — manual test steps

Colocated manual test steps for `src/widgets/PanelStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## PanelStack

Open in `Widgets/PanelStack`: Default.

1. The panel's blocks (the title, the body text, the stat
   band) sit inside an even 16px inset with 16px between
   blocks, and the panel stretches to its column's width —
   the blocks are listed, never spaced by hand.

**Run when:** `src/widgets/PanelStack.tsx`, its stories, a
detail page composing it, or a changeset naming PanelStack.
