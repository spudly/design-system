---
"@spudly/ui": patch
---

DetailRow is reclassified as a view (#715): it moves from src/widgets to src/views (component, stories, and tests), since it is a single-consumer detail-screen composition for MealPlanDetailPage's nutrition-goal rows. No props, behavior, or visual changes — the same muted label and value over a hairline — and the public pages-only export surface is unchanged.
