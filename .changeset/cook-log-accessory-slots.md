---
"@spudly/ui": major
---

RecipeDetailPage and RecipesPage: removed the `renderCookLogForm` and `renderRecipeAccessory` render slots. Both pages now render the cook-log form themselves as the DS RatingForm: RecipeDetailPage takes it as `history.cookLogForm` data (submit/skip callbacks and a pending flag) in place of the Log a cook button, and RecipesPage takes it as a `cookLogForm` data prop naming the expanded row, rendered under that row with its log-cook control hidden while open.
