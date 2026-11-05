---
"@spudly/ui": minor
---

MealDetailPage and MealFormPage now support a meal's direct ingredients (ingredients entered on the meal itself, not through a recipe). MealDetailPage accepts an optional `ingredients` list and, when it is non-empty, renders an "Ingredients" section after "Recipes" with plain, non-link rows showing each ingredient's name and its quantity/nutrition line. MealFormPage accepts optional direct-ingredient entries (name, quantity, unit, and entry servings as free-text fields) with add, remove, and change callbacks in a new "Ingredients" section; a meal with a title and only direct ingredients — no selected recipes — is now submittable. MarkableRow gains an optional pre-composed `subtitle` line under its label.
