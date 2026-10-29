---
"@spudly/ui": patch
---

RecipesPage gains a LoadingMore Storybook story covering the state the page already supported but no story exercised: with rows rendered and `isFetchingNextPage` on, the list shows its footer spinner while the next page loads — the counterpart of DiscoverPage's LoadingMore story. The story joins the Android visual-regression set (standard and narrow variants) and the RecipesPage section of the manual Storybook QA list. On a @spudly/ui bump, re-check in Storybook: Pages/Eciperay/RecipesPage's LoadingMore story lists the fixture recipes with a spinner in the list footer, and Default is unchanged.
