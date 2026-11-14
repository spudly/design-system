---
"@spudly/ui": patch
---

Fixed list pages rendering an empty body on native: ScreenContainer's `list` variant again flexes within the page shell on native (`flex: 1`), so a page whose content is a bounded list (RecipesPage's recipe list) gets a bounded viewport instead of collapsing to zero height. On Android the Recipes screen showed only its header — no search field, no filters, no recipe cards; web rendering is unchanged. Test it by opening the RecipesPage stories (or the Recipes screen in the app on Android) and confirming the search field, Filters control, and recipe rows render.
