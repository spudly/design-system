---
"@spudly/ui": patch
---

RecipeDetailPage now renders the recipe status badge exactly once: the duplicate badge in the overview panel's title card is removed, leaving only the pinned toolbar badge beside the version picker. Verify on the RecipeDetailPage stories that the status appears in the toolbar and no longer appears next to the recipe title in the overview.
