"@spudly/ui": major
---

CookingModePage and MealCookingModePage: removed the `footer` prop and the Big Footer — cooking mode is a full-screen view, and both pages now render in a plain full-viewport frame (the new FullScreenShell) with the step view filling the viewport. Hosts should stop passing footer data to both pages.
