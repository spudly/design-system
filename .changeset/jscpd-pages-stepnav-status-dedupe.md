---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: CookingModePage and MealCookingModePage now render their step navigation (progress dots plus the prev/next bar) through one shared StepNavControls instead of two identical copies, and RecipeDetailPage and PublicRecipePage now read their recipe status badge labels and tones from one shared STATUS_BADGES map instead of two identical copies, so both pairs keep rendering exactly as before and cannot drift apart.
