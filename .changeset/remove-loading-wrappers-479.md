---
"@spudly/ui": major
---

ListLoadingState and LoadingGate are removed and no longer exported. The catalog pages (Discover, Home, Meals Hub, Recipes, Shopping List, Tags) and the detail pages (Meal Plan Detail, Public Recipe, Recipe Detail) now render their loading states as a centered Spinner directly: each page's loading story/state shows the same centered spinner with the same accessible label (for example "Loading recipes" or "Loading meal plan"), and on the detail pages the spinner centers in the page shell's content area via Center's new semantic `fill` variant (Center grows to the height its parent offers; `fill` defaults off everywhere else). Test: open the Loading stories of those nine pages in Storybook and confirm the centered spinner and its label, with no other change to the loaded pages.
