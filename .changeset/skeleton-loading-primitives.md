---
"@spudly/ui": major
---

Add skeleton loading primitives (#278): `BoxSkeleton` (rectangular media/card blocks), `CircleSkeleton` (avatar and icon placeholders), and `TextSkeleton` (one or more text lines with a ragged last line), all exported from the package root. Every skeleton pulses on the shared `SkeletonClock` — one clock per screen, so all bones on a page pulse in sync — and freezes to a static block under reduced-motion or when a host passes `frozen` to `SkeletonClock` for deterministic captures. Skeletons are hidden from assistive tech; the region they stand in for carries the busy state. A Storybook page composing the three primitives into a card layout ships alongside per-primitive stories.

BREAKING: the loading prop is normalized to `loading` everywhere. Rename `isLoading` to `loading` on AccessTokensPanel, CheckboxSelectList, DiscoverPage, HomePage, MealPlansPage, MealsHubPage, RecipesPage, ShoppingListPage, and TagsPage, and in RecipeDetailPage's history view-model. Rename `isLoadingTags` to `loadingTags` on RecipeFormPage, and `isLoadingSubstitutions` to `loadingSubstitutions` on RecipeIngredientsPanel and in RecipeDetailPage's ingredients view-model. App code passing the old prop names must switch to the new ones; rendering behavior is otherwise unchanged.
