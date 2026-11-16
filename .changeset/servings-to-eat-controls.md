---
"@spudly/ui": minor
---

Meal and meal-plan editors now expose separate Servings to cook and Servings to eat controls: MealFormPage and MealPlanFormPage render a "Servings to eat" stepper beside the renamed "Servings to cook" stepper for each selected recipe (reported through the new optional `servingsToEatByRecipeId` / `onServingsToEatChange` and `onRecipeServingsToEatChange` props, falling back only to the recipe's own servings), and each direct ingredient on MealFormPage gains a "Servings to eat" field (`MealFormPageIngredient.servingsToEat`) beside its servings field, so servings to eat can be set independently of servings to cook — including leaving an ingredient's servings to eat blank.
