---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: RecipesPage and DiscoverPage now share a single CatalogPageFilterProps type for their search and filter-bar prop block (search, status, ingredient, calorie and satiety ranges, sort, and the addable-filter chooser state) instead of two identical copies, so both catalog pages keep accepting exactly the same props as before and their filter contracts cannot drift apart.
