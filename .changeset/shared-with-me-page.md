---
"@spudly/ui": minor
---

Add SharedWithMePage (spudly/design-system#49), the Shared-with-me screen as a controlled page component behind the `@spudly/ui/pages` subpath, mirroring the RecipesPage pilot. The app keeps the shared-with-me query, filter state, pagination, and permalink construction, and drives the view through props: `recipes` view-models (`id`, `title`, optional `subtitle` and `imageUrl`), `isLoading` / `isFetchingNextPage`, the same filter-bar controls as RecipesPage, `onRecipePress(id)`, and `onLoadMore`. Rows are press-only, as in the app — no row actions and no accessory slot, because nothing app-rendered appears inside this view — and the empty state carries the app's shared-with-me message. The bounded-list structure (#188: flex-bounded FlatList, filters as the list header, list mounted while loading) carries over from the app's SharedWithMeView.
