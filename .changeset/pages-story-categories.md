---
"@spudly/ui": patch
---

Organize the Pages stories under two top-level categories (#70): the nine real page stories move from flat `Pages/<Page>` titles to `Pages/Eciperay/<Page>` (RecipesPage, SharedWithMePage, RecipeDetailPage, MealPlansPage, MealPlanDetailPage) and `Pages/Memorize/<Page>` (MyVersesPage, VerseSearchPage, MemorizationSessionPage, MemorizeReviewPage). The #44 demo collections keep their `Pages/Eciperay` / `Pages/Memorize` titles as the category collections. Story ids change accordingly, so Chromatic baselines for the moved stories are re-established on the next accepted run.
