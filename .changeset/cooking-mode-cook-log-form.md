---
"@spudly/ui": minor
---

CookingModePage now accepts a `cookLogForm` data prop (#871, following the #687 pattern on RecipeDetailPage/RecipesPage) and renders the DS RatingForm in its dark variant itself in place of the step view, through a new optional panel mode on StepOverlay: hosts supply only the submit/skip callbacks, a pending flag, and optional copy overrides — no host-rendered form UI. StepOverlay's `stepLabel`, `body`, and `onDone` props are now optional (the Done pill renders only when `onDone` is provided), and a new optional `panel` prop renders a self-contained composition under the title eyebrow instead of the step content. No host changes are required, and existing CookingModePage/MealCookingModePage rendering is unchanged.
