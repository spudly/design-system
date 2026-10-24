---
"@spudly/ui": minor
---

RecipesPage: collapse the filter bar behind a Filters button (#96). Initially only the search field and the button render; the button opens an add-filter chooser, and a filter's control renders only after it is added — each added filter carries a Remove control that clears its values and hides it again. New controlled props `activeFilters` / `onActiveFiltersChange` and `filterChooserOpen` / `onFilterChooserOpenChange` (plus the `RecipesPageFilterId` type) let the app own the state; when they are omitted the view tracks it internally, seeded from any filter carrying a non-default value.
