---
"@spudly/ui": patch
---

MealCookingModePage: when the meal cook plan fails to load, the page now shows an error message instead of staying on the loading state indefinitely. Hosts render the new `state: "error"` props (with the meal title and an optional error message) when the cook-plan request fails; the page shows the message with a Done action to leave cooking mode.
