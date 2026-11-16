---
"@spudly/ui": major
---

HomePage now renders the same recipe rows as RecipesPage: `renderRecipeRow` is removed, `HomePageRecipe` carries the full recipe-row item model (title, href, subtitle, rating, image), and the new `onLogCookPress` callback fires when a row's stars are pressed. Home's recently-viewed cards are identical to the browse cards — Delete and the "Log cook" text button are gone from Home rows, and tapping the stars logs a cook.
