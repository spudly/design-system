---
component: MasonryGrid
run_when:
  - src/widgets/MasonryGrid.tsx, its stories, or a changeset naming MasonryGrid.
---

# MasonryGrid — manual test steps

Colocated manual test steps for `src/widgets/MasonryGrid.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## MasonryGrid

Open in `Widgets/MasonryGrid`: VariableHeights, Narrow, TwoColumns,
Wide, CappedColumns, FewItems, Empty.

1. VariableHeights: the twelve cards form staggered columns — cards
   stack inside each column with even gaps and no overlap or clipping,
   and the columns end at visibly unequal heights.
2. Narrow (300px container): a single column. TwoColumns (360px):
   exactly two columns. Wide (760px): exactly four columns.
3. CappedColumns: despite the 760px container, exactly two columns
   render (the `maxColumns` cap).
4. FewItems (760px, three cards): three columns with one card each —
   no empty fourth column or stray gap.
5. Empty: nothing renders and nothing errors.
6. Web Storybook only: with VariableHeights open, slowly resize the
   browser window — the column count steps down/up as the width
   crosses the breakpoints and the cards re-flow without overlap.

**Run when:** `src/widgets/MasonryGrid.tsx`, its stories, or a
changeset naming MasonryGrid.
