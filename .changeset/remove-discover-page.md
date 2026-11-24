---
"@spudly/ui": major
---

Remove `DiscoverPage` and its `DiscoverPageItem` / `DiscoverPageProps` / `DiscoverPageFilterId` types (#784). `RecipesPage` is the one unified browse page — its public variant covers the former DiscoverPage contract, and the discovery row view-model is now `RecipesPageDiscoveryItem`, defined on `RecipesPage` itself. Hosts importing `DiscoverPage` must switch to `RecipesPage` with `variant="public"`.
