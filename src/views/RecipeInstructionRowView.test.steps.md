---
component: RecipeInstructionRowView
run_when:
  - "src/views/RecipeInstructionRowView.tsx, its stories, RecipeFormPage, or a changeset naming the view."
---

# RecipeInstructionRowView — manual test steps

Colocated manual test steps for `src/views/RecipeInstructionRowView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeInstructionRowView

Open in `Views/RecipeInstructionRowView`: Default, WithoutDragHandle, Empty.
List-level checks (section label, + Add action, empty line, the
WithoutIntents story) belong to `Views/RecipeInstructionListView` — see
`RecipeInstructionListView.test.steps.md`.

1. Default: the step number renders centered beside the filled
   body field, with the host-bound Drag handle and the Remove
   action; the field is named for assistive tech by position
   ("Step 1").
2. Typing in the body field reports that row's key; Remove
   reports the row's key.
3. WithoutDragHandle: no handle renders; the step number, body
   field, and Remove action still render.
4. Empty: the body field is empty.
5. A row rendered without `onBodyChange` (as in the list
   view's WithoutIntents story) shows its body field
   non-editable: attempted edits change nothing.
6. RecipeFormPage Default: instruction rows render through the
   row view inside the form's flow, numbered by position.

**Run when:** `src/views/RecipeInstructionRowView.tsx`, its stories,
RecipeFormPage, or a changeset naming the view.
