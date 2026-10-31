---
"@spudly/ui": patch
---

RecipeOverviewPanel: the recipe title now carries level-1 heading semantics on web (Text's `heading` treatment), with its rendered appearance unchanged. PublicRecipePage, which composes the panel, now exposes the recipe title as the page's level-1 heading, so screen-reader navigation and SEO tooling can find it as a heading (e.g. `getByRole('heading', { name: <recipe title> })`); the page's section headings remain level 2 and the page has no other level-1 heading. RecipeDetailPage is unchanged — it does not compose the panel and its title already carried level-1 semantics. Native rendering is unaffected.
