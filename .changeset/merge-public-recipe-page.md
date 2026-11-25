---
"@spudly/ui": major
---

Merge PublicRecipePage into RecipeDetailPage — one auth-aware recipe page (#757). RecipeDetailPage now takes props-driven viewer modes: the owner form (unchanged) plus a guest form for signed-in non-owners and signed-out visitors (`viewer: "signedIn" | "signedOut"`), and it absorbs the public surface's `notFound` and `unavailable` states. New exported types: `RecipeDetailPageOwnerReadyProps`, `RecipeDetailPageGuestReadyProps`, `RecipeDetailPageGuestOverviewProps`, and `RecipeDetailPageCtas`. PublicRecipePage and its types are removed outright (no shim): hosts repoint to RecipeDetailPage's guest mode — the eciperay host work lands with eciperay #649.
