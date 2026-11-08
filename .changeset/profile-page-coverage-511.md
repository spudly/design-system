---
"@spudly/ui": minor
---

ProfilePage gains `nutritionGoals` and `accessTokens` data props: the daily-nutrition-goals form and the API-access-tokens panel now render inside ProfilePage from data, at the before-feedback position (nutrition goals first, then access tokens). Hosts pass the views' existing data shapes (`goals`/`onChange`/`onSave` for nutrition goals; `tokens`/`tokenName`/create/revoke handlers for access tokens) instead of composing those sections themselves. Test: open the ProfilePage WithCoverageSections story and confirm both the nutrition-goals form and the access-tokens panel render from the data props; open WithSections and confirm the slot-composed form is unchanged.
