---
component: RatingStars
run_when:
  - "src/widgets/form/RatingStars.tsx, its stories, the pages that compose RatingStars (RecipesPage and HomePage through recipeRow), or a changeset naming RatingStars."
---

# RatingStars — manual test steps

Colocated manual test steps for `src/widgets/form/RatingStars.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RatingStars

Open in `Widgets/Form/RatingStars`: Rated, Unrated, Pressable.

RatingStars renders a five-star display rating: filled stars in
warning amber up to the rounded rating, gray after; an unrated
item in the pressable form renders a single gray star button.

1. Rated shows four filled stars then one gray for the 4 rating,
   and two filled then three gray for the 2.4 rating.
2. Unrated shows five gray stars in the display form.
3. Pressable is a keyboard focus stop that activates on
   Enter/Space without navigating.

**Run when:** `src/widgets/form/RatingStars.tsx`, its stories,
the pages that compose RatingStars (RecipesPage and HomePage through recipeRow), or a
changeset naming RatingStars.
