---
component: AccordionSection
run_when:
  - "src/widgets/AccordionSection.tsx, its stories, or a changeset naming AccordionSection."
---

# AccordionSection — manual test steps

Colocated manual test steps for `src/widgets/AccordionSection.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## AccordionSection

Open in `Widgets/AccordionSection`: Closed, Open, LongTitle.

1. Closed: only the header row renders (title + chevron pointing
   down) inside the bordered frame; no body text is visible.
2. Open: the body renders expanded under a divider line, chevron
   flipped up. Pressing the header collapses it with an animated
   height; pressing again re-expands it.
3. LongTitle: the title wraps to two lines beside the chevron
   without truncating or pushing the chevron out of the frame.

**Run when:** `src/widgets/AccordionSection.tsx`, its stories, or
a changeset naming AccordionSection.
