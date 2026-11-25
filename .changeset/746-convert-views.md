---
"@spudly/ui": major
---

Convert the views' internal stacks to Row/Col (#746, Option B): BulkSelectToolbar, CommentItem, DetailRow, LogEntryCard, RecipeIngredientsPanel, RecipeOverviewPanel, and CatalogFiltersBar in the eciperay views, plus EmptyState and StatusMessage in the shared views. Single-side insets compose as Spacer siblings and the remaining off-subset geometry rides the style channel; public APIs and call sites are unchanged.
