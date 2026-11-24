---
component: PageContentColumn
run_when:
  - "src/widgets/PageContentColumn.tsx, its stories, BigFooterShell (src/widgets/content/BigFooter.tsx), AppTopBar (src/widgets/AppTopBar.tsx), or a changeset naming PageContentColumn."
---

# PageContentColumn — manual test steps

Colocated manual test steps for `src/widgets/PageContentColumn.tsx` (design-system #628).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## PageContentColumn

Open in `Widgets/PageContentColumn`: CenteredColumn, WithFullBleedBreakout.

On desktop web, page content renders in a centered column at
most 1200px wide; the Big Footer stays full-width. On native
the column is a pass-through (device-width screens).

1. CenteredColumn (wide canvas): the content block stops at
   1200px and sits centered, with clear space on both sides.
   Shrink the canvas below 1200px: the block goes full-width
   with no added column padding.
2. WithFullBleedBreakout: the primary band spans the full
   width, edge to edge, while the heading above it and the
   text below it stay inside the centered column.
3. On any page story (e.g. a page with a footer): the page
   content aligns to the same 1200px column as the AppTopBar
   content, and the Big Footer band runs full-width below it.

**Run when:** `src/widgets/PageContentColumn.tsx`, its
stories, BigFooterShell (`src/widgets/content/BigFooter.tsx`),
AppTopBar (`src/widgets/AppTopBar.tsx`), or a changeset naming
PageContentColumn.
