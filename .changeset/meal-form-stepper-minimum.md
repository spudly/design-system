---
"@spudly/ui": patch
---

MealFormPage and MealPlanFormPage: the servings and quantity steppers can no longer be decremented below 1. Previously they accepted 0, which the server rejects (minimum 1), so a meal or meal plan could be put into an unsubmittable state from the form. Test: open MealFormPage or MealPlanFormPage, select a recipe/entry, and decrement its Servings (and Quantity on the plan form) — the stepper stops at 1 and the decrement button disables there.
