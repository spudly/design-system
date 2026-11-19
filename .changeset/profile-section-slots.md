---
"@spudly/ui": major
---

ProfilePage: removed the `sectionsBeforeFeedback` and `sectionsAfterFeedback` render slots. The page now composes every section itself — pass the sections through the existing `subscription`, `nutritionGoals`, `accessTokens`, `feedbackPreferenceSection`, `transfer`, and `accountData` data props and they render in the same positions around the feedback section.
