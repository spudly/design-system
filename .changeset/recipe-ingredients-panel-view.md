---
"@spudly/ui": patch
---

RecipeIngredientsPanel is now classified as a View rather than a Widget: it lives with the other recipe views and is exported from the views barrel instead of the widgets barrel. No behavior, props, or visual changes — hosts keep rendering the same ingredients section (servings stepper, scale selector, ingredient rows, substitutions) through the recipe pages.
