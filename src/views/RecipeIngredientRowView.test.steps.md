---
component: RecipeIngredientRowView
run_when:
  - "src/views/RecipeIngredientRowView.tsx, its stories, RecipeFormPage, or a changeset naming the view."
---

# RecipeIngredientRowView — manual test steps

Colocated manual test steps for `src/views/RecipeIngredientRowView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeIngredientRowView

Open in `Views/RecipeIngredientRowView`: Default, WithoutDragHandle, Empty.
List-level checks (section label, + Add action, empty line, the
WithoutIntents story) belong to `Views/RecipeIngredientListView` — see
`RecipeIngredientListView.test.steps.md`.

1. Default: the row's quantity, unit, and name fields render
   filled, with the host-bound Drag handle and the Remove
   action; the fields are named for assistive tech by position
   ("Ingredient 1 quantity" / "unit" / "name").
2. Typing in a field reports that row's key and field; Remove
   reports the row's key.
3. WithoutDragHandle: no handle renders; the fields and the
   Remove action still render.
4. Empty: every field is empty with its placeholder showing.
5. A row rendered without `onFieldChange` (as in the list
   view's WithoutIntents story) shows its fields non-editable:
   attempted edits change nothing.
6. RecipeFormPage Default: ingredient rows render through the
   row view inside the form's flow.

**Run when:** `src/views/RecipeIngredientRowView.tsx`, its stories,
RecipeFormPage, or a changeset naming the view.
