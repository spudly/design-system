---
"@spudly/ui": patch
---

Name the RecipesPage row press targets for screen readers (spudly/design-system#60): the thumbnail and text press targets of each RecipeRow now carry `accessibilityRole="button"` and `accessibilityLabel={item.title}`, the same treatment SharedWithMePage's SharedRecipeRow received in #58. The thumbnail target wraps only an image (or an empty placeholder), so without the label a screen reader met an unidentified action for every recipe.
