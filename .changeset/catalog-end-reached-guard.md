---
"@spudly/ui": patch
---

Catalog pages (RecipesPage, including its public variant): the next page is now fetched only after the reader actually scrolls to the end of the list — the first page renders without an unprompted fetch for page two. Testable: render a catalog page with a host `onLoadMore` and do not scroll — no next-page fetch happens on mount; scroll to the end — the next page is fetched exactly once, and a page that adds no new rows still chains its continuation exactly once.
