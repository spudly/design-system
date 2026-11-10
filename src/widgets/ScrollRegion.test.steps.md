---
component: ScrollRegion
run_when:
  - "src/widgets/ScrollRegion.tsx, its stories, a fixed-shell page's scroll region, or a changeset naming ScrollRegion."
---

# ScrollRegion — manual test steps

Colocated manual test steps for `src/widgets/ScrollRegion.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ScrollRegion

Open in `Widgets/ScrollRegion`: Default.

1. Native: the "Pinned header" block stays at the top and the
   "Pinned footer" block at the bottom of the 480px frame while
   the twelve section paragraphs between them scroll; the
   scrolling region fills exactly the space between the header
   and footer — no gap, no overlap.
2. Web: there is no inner scroller — the header, all twelve
   paragraphs, and the footer render in one document flow and
   the page scrolls as a whole, the footer after the full
   content (the #547 page-scroll model).
3. Keyboard only (web): the arrow / Page Down keys scroll the
   page without focusing the region first — the document is the
   scroller, so no focusable scroll region is needed.

**Run when:** `src/widgets/ScrollRegion.tsx`, its stories,
a fixed-shell page's scroll region, or a changeset naming
ScrollRegion.
