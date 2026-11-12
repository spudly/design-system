---
component: RecipeExportPickerView
run_when:
  - "src/views/TransferRecipesView.tsx, src/views/RecipeExportPickerView.tsx, their stories, ProfilePage, or a changeset naming either view."
---

# RecipeExportPickerView — manual test steps

Colocated manual test steps for `src/views/RecipeExportPickerView.tsx` (design-system #530).
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
2. Picker Loading: the whole picker skeletonizes at the loaded
   layout's geometry — the search field renders as a
   field-shaped bone, the toolbar's actions and the "1
   selected" count render as text bones, the list shows
   skeleton rows, and the export action renders as a skeleton.
   No live input, placeholder text, real count, or item labels
   show.

**Run when:** `src/views/TransferRecipesView.tsx`,
`src/views/RecipeExportPickerView.tsx`, their stories,
ProfilePage, or a changeset naming either view.
