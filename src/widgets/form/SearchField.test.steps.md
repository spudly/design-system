---
component: SearchField
run_when:
  - "src/widgets/form/FieldRow.tsx, its stories, src/widgets/form/SearchField.tsx (the grow prop), the pages that compose FieldRow (VerseSearchPage), or a changeset naming FieldRow."
---

# SearchField — manual test steps

Colocated manual test steps for `src/widgets/form/SearchField.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FieldRow

Open in `Widgets/Form/FieldRow`: Default, SmallAction.

A FieldRow composes form fields and their action on one line —
here a search field with its submit button.

1. The search field fills the row's remaining width, the Search
   button keeps its natural width, and the action stretches to
   the field's height so field and button line up as one bar
   (VerseSearchPage's search row is the live case); SmallAction
   shows the same with a small action (the catalog bar's
   Filters button), which stretches to the search field's
   height instead of sitting shorter.

**Run when:** `src/widgets/form/FieldRow.tsx`, its stories,
`src/widgets/form/SearchField.tsx` (the `grow` prop), the pages
that compose FieldRow (VerseSearchPage), or a changeset
naming FieldRow.
