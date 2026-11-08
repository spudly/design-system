---
component: FormStack
run_when:
  - "src/widgets/FormStack.tsx, src/widgets/TrailingActionsRow.tsx, src/widgets/Card.tsx, their stories, TagsPage's forms or rows, or a changeset naming any of them. (namely: FormStack, TrailingActionsRow, Card, TagsPage)"
  - "any of these components, their stories, or a changeset naming them. Run only the numbered case for the component(s) that changed. (namely: StepList, MarkableRow, SuggestionPanel, TagList, FormStack, TextActionCardRow, CenteredText, StatusMessage, FieldRow, RemovableField)"
  - "any of these components, their stories, the form pages, or a changeset naming them. (namely: FormStack, FormHeading, LabeledField, LabeledGroup, FieldLabel, RevertAction, ChangedListBanner, RecipeFormPage, MealFormPage, MealPlanFormPage, TagsPage)"
---

# FormStack — manual test steps

Colocated manual test steps for `src/widgets/FormStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FormStack & TrailingActionsRow; Card's compact variant

Open in `Widgets/FormStack`: Default, FieldsWithActions;
`Widgets/TrailingActionsRow`: FieldAndAction,
ContentAndGhostButtons, Narrow; `Widgets/Card`: Compact.

1. FormStack: the form's fields stack at an even 12px rhythm
   with the button row last.
2. TrailingActionsRow FieldAndAction: the leading group sits
   at the left and the action at the right on one line.
   ContentAndGhostButtons: the badge sits left, Edit / Delete
   right, at a 12px gap between the actions. Narrow: when the
   groups cannot fit, the action wraps below the leading group
   instead of overflowing.
3. Card Compact: the surface is the small card treatment —
   12px padding, medium corners, small shadow, no border (the
   former CompactCard, folded into Card as `variant="compact"`
   under Stephen's 2026-10-29 ruling).

**Run when:** `src/widgets/FormStack.tsx`,
`src/widgets/TrailingActionsRow.tsx`,
`src/widgets/Card.tsx`, their stories, TagsPage's
forms or rows, or a changeset naming any of them.

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

## Form set (FormStack, FormHeading, LabeledField, LabeledGroup, FieldLabel, RevertAction, ChangedListBanner)

Open in `Widgets/FormStack`: Default, FieldsWithActions;
`Widgets/FormHeading`: Default, WithSubtitle;
`Widgets/LabeledField`: Default, WithAction, WithError;
`Widgets/LabeledGroup`: Default, WithAction;
`Widgets/FieldLabel`: Default, Associated;
`Views/RevertAction` and `Views/ChangedListBanner`
(their stories).

1. FormStack: fields render in order with the form rhythm —
   even 12px separation, with no extra tail below the
   last field (FormStack's gap is spacing[3] = 12px and it
   adds no bottom padding).
2. FormHeading: the title renders in the form-title treatment;
   WithSubtitle shows the hint line under the title.
3. LabeledField: the label sits 4px over the field; on web the
   label is a real label element — clicking it focuses the
   field. WithError shows the error line below the field in
   the error treatment; WithAction shows the action at the
   label row's end.
4. LabeledGroup: the label sits 8px over the grouped control —
   the wider separation than a field's; the group announces
   itself by the label's name.
5. RevertAction: the `Revert to: <label>` text action renders
   in the primary ink and presses like a button.
6. ChangedListBanner: the single host-supplied summary line
   renders on the warning wash; the "Revert" action appears
   only in the story that passes a revert handler.

**Run when:** any of these components, their stories, the form
pages, or a changeset naming them.
