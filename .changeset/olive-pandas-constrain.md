---
"@spudly/ui": patch
---

Fix PresetValueSelector overflowing narrow viewports: the presets row now takes a zero flex basis so the custom slot keeps room for its label instead of the label spilling past the viewport edge (RecipeDetailPage had a 2px horizontal overflow at 390px).
