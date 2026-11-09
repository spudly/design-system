---
component: TransferRecipesView
run_when:
  - "src/views/TransferRecipesView.tsx, src/views/RecipeExportPickerView.tsx, their stories, ProfilePage, or a changeset naming either view."
---

# TransferRecipesView — manual test steps

Colocated manual test steps for `src/views/TransferRecipesView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## TransferRecipesView & RecipeExportPickerView

Open in `Views/TransferRecipesView`: Default; and in
`Views/RecipeExportPickerView`: WithSelection, Loading.

1. Transfer Default: the section hint, the picker (toolbar
   with "1 selected", two listed recipes, "Export selected
   (1)"), the Import recipes button, and the success summary
   line render in order on the elevated card.
2. Picker Loading: the list region shows the loading spinner
   and the export button is disabled.

**Run when:** `src/views/TransferRecipesView.tsx`,
`src/views/RecipeExportPickerView.tsx`, their stories,
ProfilePage, or a changeset naming either view.
