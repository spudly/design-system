---
component: LabelRow
run_when:
  - "any of these components, their stories, the form pages, or a changeset naming them. (namely: LabelRow, LabeledField, LabeledGroup, FieldLabel, RecipeFormPage, MealFormPage, MealPlanFormPage, TagsPage)"
---

# LabelRow — manual test steps

Colocated manual test steps for `src/widgets/data/LabelRow.tsx` (design-system #718).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Label row (LabelRow, LabeledField, LabeledGroup)

Open in `Widgets/LabeledField`: Default, WithAction, WithError;
`Widgets/LabeledGroup`: Default, WithAction.

1. LabeledField: the label sits 4px over the field; on web the
   label is a real label element — clicking it focuses the field.
   WithAction shows the action at the label row's end.
2. LabeledGroup: the label sits 8px over the grouped control —
   the wider separation than a field's.

**Run when:** any of these components, their stories, the form
pages, or a changeset naming them.
