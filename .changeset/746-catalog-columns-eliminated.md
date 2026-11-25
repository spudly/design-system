---
"@spudly/ui": major
---

#746 tranche 4: the catalog columns and row are eliminated. CatalogCardColumn, CatalogListColumn, and CatalogRow are removed from the package; RecipesPage composes Col directly (the card column is a Col at gap "m" with px "l", the list column a Col with px "l" whose rows keep carrying their own bottom separation, and each CatalogRow site is a Col with a trailing Spacer carrying the row's 12px bottom separation — the catalog rows own their separation individually, so no parent gap can own it). Per the approved plan, the columns' bottom insets are page-owned spacing now.
