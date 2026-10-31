---
"@spudly/ui": patch
---

MealCookingModePage: the step header now shows the step's position in the combined meal sequence instead of the step's number within its own recipe. In a meal combining multiple recipes, the final combined step now reads e.g. "Step 3 of 3 · <second recipe>" (previously "Step 1 of 3"), agreeing with the progress dots / progressbar ("Step 3 of 3"). Test: open a meal cooking mode that combines a 2-step recipe with a 1-step recipe, step to the last step, and confirm the header and the progress indicator both read step 3 of 3.
