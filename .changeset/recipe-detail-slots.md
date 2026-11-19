---
"@spudly/ui": major
---

RecipeDetailPage: removed the `renderSharingControls` and `renderComments` render slots. Pass those sections through the existing `sharing` and `comments` data props instead — they render the same sharing and comments views in the same positions.
