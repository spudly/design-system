---
"@spudly/ui": patch
---

Eciperay sage accent and photography-led pages (#852): Badge gains an `accent` tone filled with the theme's semantic accent (sage #5f6f52 under Warm Harvest) for secondary/tag roles, the recipe rows' shared-with-me badge takes that tone, and HomePage's secondary actions take the accent Button variant. HomePage, RecipesPage, and MealPlansPage each gain an optional host-supplied `leadImageUrl` lead slot that renders the hero Thumbnail above the page content when supplied and renders nothing when it is not — no placeholder art is baked in.
