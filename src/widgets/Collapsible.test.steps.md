---
component: Collapsible
run_when:
  - src/widgets/Collapsible.tsx, its stories, or a changeset naming Collapsible.
---

# Collapsible — manual test steps

Colocated manual test steps for `src/widgets/Collapsible.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Collapsible

Open in `Widgets/Collapsible`: Closed, Open, Interactive.

1. Closed renders nothing visible; Open renders the full content
   block.
2. Interactive: the Toggle button animates the region open and
   closed — height grows/shrinks smoothly rather than snapping, and
   no content spills outside the frame mid-animation.

**Run when:** `src/widgets/Collapsible.tsx`, its stories, or a
changeset naming Collapsible.
