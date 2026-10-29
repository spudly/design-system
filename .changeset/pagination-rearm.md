---
"@spudly/ui": minor
---

Shared pagination re-arm for the catalog pages (design-system #285): RecipesPage and DiscoverPage now paginate through one shared pattern. When a next-page fetch completes without adding any new rows — every item filtered out client-side, or all duplicates — the page requests the following page itself instead of stalling until the user scrolls away and back, and a page request is never duplicated while a fetch is already in flight (RecipesPage previously wired the host callback straight to the list's end-reached signal). On a @spudly/ui bump, re-check in Storybook: Pages/DiscoverPage's LoadingMore story still shows the footer spinner while a next page is in flight, and both pages' populated stories render unchanged.
