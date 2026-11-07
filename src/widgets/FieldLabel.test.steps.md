---
component: FieldLabel
run_when:
  - any of these components, their stories, the form pages, or a changeset naming them.
---

# FieldLabel — manual test steps

Colocated manual test steps for `src/widgets/FieldLabel.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Form set (FormStack, FormHeading, LabeledField, LabeledGroup, FieldLabel, RevertAction, ChangedListBanner)

Open in `Widgets/FormStack`: Default, FieldsWithActions;
`Widgets/FormHeading`: Default, WithSubtitle;
`Widgets/LabeledField`: Default, WithAction, WithError;
`Widgets/LabeledGroup`: Default, WithAction;
`Widgets/FieldLabel`: Default, Associated;
`Views/RevertAction` and `Views/ChangedListBanner`
(their stories).

1. FormStack: fields render in order with the form rhythm —
   even 16px separation and the longer tail below the last
   field.
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
5. RevertAction: the "Revert to: <label>" text action renders
   in the warning ink and presses like a button.
6. ChangedListBanner: the changed-lines list renders on the
   warning wash; the "Revert changes" action appears only in
   the story that passes a revert handler.

**Run when:** any of these components, their stories, the form
pages, or a changeset naming them.
