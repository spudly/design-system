---
"@spudly/ui": minor
---

Add an optional per-row accessory slot to RecipesPage (spudly/design-system#49): `renderRecipeAccessory?: (recipeId: string) => ReactNode` is called once per row, and the returned node renders directly under that row's card inside the list item; returning null/undefined renders nothing. When a row's accessory renders non-null content, that row's "Log cook" button is hidden, so the Eciperay app can expand its inline cook-log form under a recipe (form, state, and mutation stay app-side) while reproducing its button-hides-while-open behavior. Existing rendering is unchanged when the prop is not provided.
