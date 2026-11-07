---
component: CheckRow
run_when:
  - "src/widgets/CheckRow.tsx, its stories, ShoppingListPage's list, or a changeset naming CheckRow."
---

# CheckRow — manual test steps

Colocated manual test steps for `src/widgets/CheckRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CheckRow

Open in `Widgets/CheckRow`: Default, Checked, LabelOnly.

1. Default: an outlined box sits left of a bold label with
   its muted detail ("2 tbsp · optional") on the same line,
   over a hairline; the whole row is the press target
   (pointer cursor on web, Enter/Space toggle it, the
   story's row checks and unchecks).
2. Checked: the box fills with the primary color and a check
   glyph, and the label renders muted and struck through.
3. LabelOnly: no detail segment renders — the label stands
   alone with no trailing separator.

**Run when:** `src/widgets/CheckRow.tsx`, its stories,
ShoppingListPage's list, or a changeset naming CheckRow.
