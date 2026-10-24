---
"@spudly/ui": minor
---

RecipesPage: rework the row actions. **Breaking:** the `onRecipeDelete` prop is removed — a recipes list row no longer offers Delete at all; deleting a recipe lives on RecipeDetailPage (its `onDeletePress` chip), so consumers must stop passing the callback. The "Log cook" text button is also gone: `RecipesPageItem` gains an optional `rating` field (display rating 0–5, or null/absent when unrated), and the row's log-cook control is the rating itself — a rated recipe renders its five stars as the pressable that fires `onLogCookPress`, and an unrated recipe renders a single icon-only button (one unfilled star, no text) firing the same callback. Both states carry an accessibility label naming the log-cook action. The change also sheds the row's inflexible button width, which still crowded the text block in narrow viewports after the #205 wrap fix.
