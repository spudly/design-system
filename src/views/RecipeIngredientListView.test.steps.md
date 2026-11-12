---
component: RecipeIngredientListView
run_when:
  - "src/views/RecipeIngredientListView.tsx, its stories, RecipeFormPage, or a changeset naming the view."
---

# RecipeIngredientListView — manual test steps

Colocated manual test steps for `src/views/RecipeIngredientListView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeIngredientListView

Open in `Views/RecipeIngredientListView`: Default, Empty, WithoutIntents (row views:
Default, WithoutDragHandle, Empty); and in
`Pages/Eciperay/RecipeFormPage`: Default and Empty.

1. Default: the section label, the rows in order with their
   fields filled, the host-bound Drag handle on each row, the
   Remove action on each row, and the + Add action in the
   label row render.
2. Typing in a row field updates only that row; Remove drops
   its row (later rows renumber / keep their values); + Add
   appends an empty row.
3. Empty: the empty line renders in place of rows; the + Add
   action stays.
4. WithoutIntents / WithoutDragHandle: no add, remove, or
   handle elements render; the row content still renders.
5. RecipeFormPage Default: both list sections render through
   the views inside the form's flow; Empty: both sections show
   their empty lines.

**Run when:** `src/views/RecipeIngredientListView.tsx`, its stories,
RecipeFormPage, or a changeset naming the view.
