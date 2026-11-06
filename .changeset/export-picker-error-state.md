---
"@spudly/ui": patch
---

RecipeExportPickerView: while the picker shows a load error (its items hidden behind the error alert), the bulk toolbar's Select all is now disabled — it can no longer select items the user cannot see. An existing selection can still be cleared from the same toolbar during the error state: BulkSelectToolbar's Clear selection now disables only when the controls are disabled/busy or nothing is selected, instead of when the visible list is empty.
