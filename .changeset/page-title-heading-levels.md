---
"@spudly/ui": patch
---

Page titles are now level-1 headings on web: the standalone titles of AddRecipeMenuPage ("Add Recipe"), FeedbackPage ("Feedback"), MealDetailPage, MealPlanDetailPage, MealsHubPage ("Meals"), ProfilePage ("Profile"), ShoppingListPage ("Shopping list"), and TagsPage ("Tags") previously used the subheading text variant, so on web each was exposed as a level-2 heading and the page had no level-1 heading at all. They now use the heading variant, so screen-reader users navigating by heading find the page title at level 1; each page has exactly one level-1 heading. Visual rendering is unchanged — every title keeps its existing extra-large bold styling. On a @spudly/ui bump, re-check in Storybook (Pages/Eciperay for each page above): the page title is the page's single level-1 heading (role "heading", aria-level 1 in the web DOM) and looks identical to before; HomePage is unchanged (its title was already level 1 and its section title stays level 2).
