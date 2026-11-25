---
component: ScrollSentinel
run_when:
  - "src/widgets/layout/ScrollSentinel.tsx, its stories, the pages that compose ScrollSentinel (RecipesPage), or a changeset naming ScrollSentinel."
---

# ScrollSentinel — manual test steps

Colocated manual test steps for `src/widgets/layout/ScrollSentinel.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ScrollSentinel

Open in `Widgets/ScrollSentinel`: Default.

A ScrollSentinel is the 1px marker at the end of a paginated
web list; an observer reads its position to request more rows.

1. Nothing visible renders below the story's text (the marker
   is 1px tall), and scrolling a live paginated catalog
   (RecipesPage on web) to the marker's margin requests the
   next page — with no duplicate request while a fetch is in
   flight, and a further request allowed once that fetch
   completes even if the marker never left the margin.

**Run when:** `src/widgets/layout/ScrollSentinel.tsx`, its stories,
the pages that compose ScrollSentinel (RecipesPage), or a
changeset naming ScrollSentinel.
