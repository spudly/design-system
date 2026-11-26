---
component: RecipeIngredientListView
run_when:
  - "src/views/eciperay/RecipeIngredientListView.tsx, its stories, RecipeFormPage, or a changeset naming the view."
---

# RecipeIngredientListView — manual test steps

Colocated manual test steps for `src/views/eciperay/RecipeIngredientListView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeIngredientListView

Open in `Views/RecipeIngredientListView`: Default, WithDefaultDragHandle, Empty, WithoutIntents (row views:
Default, WithoutDragHandle, Empty); and in
`Pages/Eciperay/RecipeFormPage`: Default and Empty.

1. Default: the section label, the rows in order with their
   fields filled, the host-bound Drag handle on each row, the
   Remove action on each row, and the + Add action in the
   label row render.
2. WithDefaultDragHandle: no host handle is bound, so each
   row renders the design system's own six-dot grip
   (DragHandleView, #878) in place of the host Drag handle.
3. Typing in a row field updates only that row; Remove drops
   its row (later rows renumber / keep their values); + Add
   appends an empty row.
4. Empty: the empty line renders in place of rows; the + Add
   action stays.
5. WithoutIntents: no add or remove actions render; each row
   still renders the default DS grip. WithoutDragHandle (row
   view): no handle element renders; the row content still
   renders.
6. RecipeFormPage Default: both list sections render through
   the views inside the form's flow; Empty: both sections show
   their empty lines.

**Run when:** `src/views/eciperay/RecipeIngredientListView.tsx`, its stories,
RecipeFormPage, or a changeset naming the view.
