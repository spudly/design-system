---
"@spudly/ui": patch
---

CommentItem is reclassified as a View: it moved from `src/widgets/` to `src/views/` (component and stories), is exported from the views barrel instead of the widgets barrel, and its sole consumer (RecipeCommentsView) imports it as a sibling view. No behavior, props, or visual changes.
