---
"@spudly/ui": patch
---

MealsHubPage / MealPlansPage: the meal-plan row Delete action now carries the accessible label "Delete {plan name}" (via CardRow's trailing action, whose accessible name now composes the action label with the row title), matching the meal rows' "Delete {title}" treatment — screen-reader users can now distinguish Delete controls across multiple meal plans.
