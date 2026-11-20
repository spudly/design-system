---
"@spudly/ui": patch
---

RecipesPage no longer applies styling directly (#119 tranche 3): its catalog rows render in the new CatalogRow, the public web column in the new CatalogCardColumn, the signed-in web column in the new CatalogListColumn, its loading own-section rows as the new LoadingMediaRow, and its scroll sentinel as the new ScrollSentinel; the page reads the platform flag through the widgets layer. Rendering is unchanged.
