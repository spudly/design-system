---
"@spudly/ui": patch
---

BulkSelectToolbar is reclassified as a View: it moved from `src/widgets/` to `src/views/` (component, stories, and test steps), is exported from the views barrel instead of the widgets barrel, and its sole consumer (RecipeExportPickerView) imports it as a sibling view. No behavior, props, or visual changes.
