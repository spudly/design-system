---
"@spudly/ui": patch
---

Storybook page stories: the seven page stories whose loading-overlay stories still pinned their own 430×844 frame (MealPlanDetailPage, MealPlansPage, PublicRecipePage, RecipeDetailPage, RecipeFormPage, ShoppingListPage, TagsPage) now render into the preview's viewport-driven frame, so switching the Storybook viewport toolbar to wide/desktop/full visibly resizes those pages and phone restores 430×844. MealsHubPage's long-plan regression stories declare their 864px capture width through the preview instead of a fixed wrapper, keeping their default captures unchanged. No component or page behavior changes.
