---
component: BrandLink
run_when:
  - src/widgets/BigFooter.tsx, BrandLink.tsx, their stories, or a changeset naming any of them.
---

# BrandLink — manual test steps

Colocated manual test steps for `src/widgets/BrandLink.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Public chrome (BigFooter & BrandLink)

Open in `Widgets/BigFooter`: Default, Memorize, NoSocialsYet, MobileStacked, StickyOnShortPage;
`Widgets/BrandLink`: Default.

1. The footer band (BigFooter, #410): the big brand wordmark,
   the link columns, app-store links, and social icon links the
   caller passed in as the one `footer` object (the story passes
   a Legal column with Privacy / Terms / Do Not Sell or Share),
   rendered in the caller's order as real links. Below the
   640px stack breakpoint (check at a 430px mobile width, the
   MobileStacked story) the columns collapse to a stacked
   single column with no horizontal scrolling; on a short page
   (StickyOnShortPage) the footer sits at the viewport bottom.
2. BrandLink: the wordmark is the semibold primary wordmark
   with no underline, rendered as a real link (the DOM node is
   an anchor carrying its href; right-click offers "Open in
   new tab"). Public pages render it in their header rows —
   check LegalDocumentPage's header row for the same contract
   in place.

**Run when:** `src/widgets/BigFooter.tsx`,
`BrandLink.tsx`, their stories, or a changeset naming any of
them.
