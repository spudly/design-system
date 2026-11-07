---
component: RecipeSharingView
run_when:
  - "src/views/RecipeSharingView.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeSharingView."
---

# RecipeSharingView — manual test steps

Colocated manual test steps for `src/views/RecipeSharingView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeSharingView

Open in `Views/RecipeSharingView`: PublicWithConsent, Private.

1. PublicWithConsent: the Public option is selected, the
   discoverability warning shows, the consent checkbox is
   unchecked and **Save visibility is disabled** until it is
   checked; the share-link row (Rotate / Copy) and the public
   permalink row render under the Save button.
2. Private: no warning, no consent checkbox, no permalink row.

**Run when:** `src/views/RecipeSharingView.tsx`, its stories,
RecipeDetailPage, or a changeset naming RecipeSharingView.
