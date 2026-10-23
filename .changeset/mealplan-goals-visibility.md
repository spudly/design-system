---
"@spudly/ui": minor
---

feat(pages): MealPlanDetailPage gains an explicit `goalsSectionVisibility` control ("auto" | "shown" | "hidden", default "auto") for its Nutrition goals section (#78). "shown" reproduces the old app behavior for a plan whose nutrition data is present but unavailable (no summary, no goal progress): the section renders with only the set-goals hint card, a case the previous data-keyed rule could not express. "hidden" suppresses the section even when goal progress or a summary is present. Existing consumers on "auto" are unchanged.
