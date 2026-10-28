---
"@spudly/ui": minor
---

New MasonryGrid widget: a Pinterest-style staggered grid whose column count adapts to the width available to it — one column in a narrow pane, up to four on wide screens by default, tunable through `minColumnWidth`, `minColumns`, and `maxColumns` props. Hosts pass `items` and a `renderItem` function; item content and data stay app-side, and the same layout renders on React Native and web. On a @spudly/ui bump, re-test in Storybook (Components/MasonryGrid): VariableHeights shows staggered columns of unequal height with even gaps and no overlapping or clipped cards; Narrow shows a single column, TwoColumns exactly two, Wide exactly four; CappedColumns holds at two despite the wide container; FewItems shows no empty column; and on web, resizing the browser window re-flows the columns without overlap.
