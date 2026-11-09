---
component: FieldRow
run_when:
  - "src/widgets/FieldRow.tsx, its stories, src/views/SearchField.tsx (the grow prop), the pages that compose FieldRow (VerseSearchPage), or a changeset naming FieldRow."
  - "any of these components, their stories, or a changeset naming them. Run only the numbered case for the component(s) that changed. (namely: StepList, MarkableRow, SuggestionPanel, TagList, StatusMessage, FieldRow, RemovableField)"
---

# FieldRow — manual test steps

Colocated manual test steps for `src/widgets/FieldRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FieldRow

Open in `Widgets/FieldRow`: Default, SmallAction.

A FieldRow composes form fields and their action on one line —
here a search field with its submit button.

1. The search field fills the row's remaining width, the Search
   button keeps its natural width, and the action stretches to
   the field's height so field and button line up as one bar
   (VerseSearchPage's search row is the live case); SmallAction
   shows the same with a small action (the catalog bar's
   Filters button), which stretches to the search field's
   height instead of sitting shorter.

**Run when:** `src/widgets/FieldRow.tsx`, its stories,
`src/views/SearchField.tsx` (the `grow` prop), the pages
that compose FieldRow (VerseSearchPage), or a changeset
naming FieldRow.

## Content rows (StepList, MarkableRow, SuggestionPanel, TagList, StatusMessage, FieldRow, RemovableField)

Open in `Widgets/StepList`: Default;
`Widgets/MarkableRow`: Default;
`Widgets/SuggestionPanel`: Default;
`Widgets/TagList`: Default;
`Widgets/StatusMessage`: Default, Empty, Transient;
`Widgets/FieldRow`: (its stories);
`Widgets/RemovableField`: (its stories).

1. StepList: steps render numbered in order; a step with a
   heading shows it above its body.
2. MarkableRow: the row's mark toggle flips its marked state
   treatment without shifting the row layout.
3. SuggestionPanel: the panel title sits over one entry per
   suggestion, in the caller's order.
4. TagList: one Badge per tag in the caller's tag colors,
   wrapping onto the next line when the viewport is narrowed
   to 360px (the four badges fit on one line at the story's
   430px width, so do not expect wrapping there) — display
   only, nothing presses.
5. FieldRow: the search field claims the row's width and its
   trailing action stretches to the field's height and sits at
   the end; RemovableField's remove
   button's accessible name names the filter it
   removes (e.g. "Remove Ingredient filter"), not the
   field's value.
6. StatusMessage: the message line is centered, small, and in
   muted ink that stays readable in the dark theme; Empty shows
   nothing (the live region is mounted but empty); Transient's
   toggle makes the confirmation appear and disappear under the
   button row without shifting focus.

**Run when:** any of these components, their stories, or a
changeset naming them. Run only the numbered case for the
component(s) that changed.
