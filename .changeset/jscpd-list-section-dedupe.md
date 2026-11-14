---
"@spudly/ui": patch
---

RecipeIngredientListView and RecipeInstructionListView render their labeled section, add action, empty state, and row stack through one shared internal component. Rendering is unchanged: the section label and add action stay in the label row, an empty list still shows its muted empty message, and rows still stack with the same spacing in order.
