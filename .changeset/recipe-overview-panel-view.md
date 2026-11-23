---
"@spudly/ui": patch
---

RecipeOverviewPanel is now classified as a View rather than a Widget: it lives with the other recipe views and is exported from the views barrel instead of the widgets barrel. No behavior, props, or visual changes — hosts keep rendering the same overview header (hero image, title, status badge, stat band, tag row) through the recipe pages.
