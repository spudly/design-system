---
component: ScrollRegion
run_when:
  - src/widgets/ScrollRegion.tsx, its stories, a fixed-shell page's scroll region, or a changeset naming ScrollRegion.
---

# ScrollRegion — manual test steps

Colocated manual test steps for `src/widgets/ScrollRegion.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ScrollRegion

Open in `Widgets/ScrollRegion`: Default.

1. The "Pinned header" block stays at the top and the "Pinned
   footer" block at the bottom of the 480px frame while the
   twelve section paragraphs between them scroll.
2. The scrolling region fills exactly the space between the
   header and footer — no gap, no overlap.
3. Keyboard only: Tab reaches the scrolling region itself (its
   paragraphs contain no focusable elements) and the arrow /
   Page Down keys scroll it.

**Run when:** `src/widgets/ScrollRegion.tsx`, its stories,
a fixed-shell page's scroll region, or a changeset naming
ScrollRegion.
