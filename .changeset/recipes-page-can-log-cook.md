---
"@spudly/ui": patch
---

RecipesPage: hosts can now suppress the log-cook control per row. `RecipesPageItem` gains an optional `canLogCook` field — set it `false` for a row the user cannot log a cook for (e.g. a shared-with-me recipe, since cook logs are owner-only) and that row renders no log-cook control at all, in both its rated (stars) and unrated (star button) states; the row stays a link with its badge unchanged. Rows that omit the field keep the control exactly as before, and the badge alone does not suppress it. Test: open the RecipesPage unified-browse story and confirm the two "Shared with you" rows show no stars or star button while the created rows keep theirs; press a created row's control and confirm it still fires.
