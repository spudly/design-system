---
component: TextActionCardRow
run_when:
  - "src/widgets/TextActionCardRow.tsx, its stories, MealsHubPage's meal list, or a changeset naming TextActionCardRow."
  - "any of these components, their stories, or a changeset naming them. Run only the numbered case for the component(s) that changed. (namely: StepList, MarkableRow, SuggestionPanel, TagList, FormStack, TextActionCardRow, CenteredText, StatusMessage, FieldRow, RemovableField)"
---

# TextActionCardRow — manual test steps

Colocated manual test steps for `src/widgets/TextActionCardRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## TextActionCardRow

Open in `Widgets/TextActionCardRow`: Default, TitleOnly.

1. Default: an elevated card with the title in semibold over
   its muted subtitle; the text block is a link (anchor on
   web) and "Delete" sits at the right edge as bare text —
   pressing Delete does not navigate.
2. TitleOnly: the card shows the title alone, no subtitle line
   and no empty gap where it would sit.

**Run when:** `src/widgets/TextActionCardRow.tsx`, its
stories, MealsHubPage's meal list, or a changeset naming
TextActionCardRow.

## Content rows (StepList, MarkableRow, SuggestionPanel, TagList, FormStack, TextActionCardRow, CenteredText, StatusMessage, FieldRow, RemovableField)

Open in `Widgets/StepList`: Default;
`Widgets/MarkableRow`: Default;
`Widgets/SuggestionPanel`: Default;
`Widgets/TagList`: Default; `Widgets/FormStack`: (its
stories); `Widgets/TextActionCardRow`: (its stories);
`Widgets/CenteredText`: (its stories);
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
