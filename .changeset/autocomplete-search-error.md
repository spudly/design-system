---
"@spudly/ui": patch
---

AutocompletePicker, MealFormPage, MealPlanFormPage: a failed recipe/entry search no longer reads as "no matches". Hosts pass the new optional `searchError` prop (threaded from both meal form pages to the picker); while it is set, the picker's empty state shows the search error and its live region announces the error instead of "No recipes found." / "No meals or recipes found.". On a @spudly/ui bump, re-check in Storybook: Components/AutocompletePicker's SearchError story shows the error text with no no-results message, and the NoResults story still shows the no-results message for a search that completed with no matches.
