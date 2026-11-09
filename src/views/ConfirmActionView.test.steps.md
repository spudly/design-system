---
component: ConfirmActionView
run_when:
  - "src/views/ConfirmActionView.tsx, its stories, RecipeDetailPage, or a changeset naming ConfirmActionView."
---

# ConfirmActionView — manual test steps

Colocated manual test steps for `src/views/ConfirmActionView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ConfirmActionView

Open in `Views/ConfirmActionView`: DeleteConfirmation,
WithError, Notice.

1. DeleteConfirmation: the dialog title is "Delete this
   recipe?" and its description is "This permanently deletes
   the recipe and its cook history."; Cancel in the secondary
   treatment and Delete recipe in the danger treatment;
   keyboard focus lands inside the dialog and Tab cycles
   within it.
2. WithError: the error alert renders inside the dialog above
   the actions. Notice: a single primary OK action, no Cancel.

**Run when:** `src/views/ConfirmActionView.tsx`, its stories,
RecipeDetailPage, or a changeset naming ConfirmActionView.
