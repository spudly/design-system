---
"@spudly/ui": patch
---

Fix PresetValueSelector's Custom button label wrapping mid-word ("Custo/m") and rendering taller than the preset row at narrow widths (e.g. the Android VR capture width): the custom slot now takes a larger share of the selector row, while the preset buttons stay equal-width. On a @spudly/ui bump, re-check the Scale row in Storybook (Components/PresetValueSelector — Default, CustomSelected) and on RecipeDetailPage and PublicRecipePage (Default + Ingredients stories): the Custom label sits on one line and all five buttons in the row are the same height.
