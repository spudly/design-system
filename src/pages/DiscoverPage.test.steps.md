---
component: DiscoverPage
run_when:
  - "a catalog page's loading state (Discover, Home, MealsHub, Recipes, ShoppingList, Tags), or a changeset naming the list loading states."
---

# DiscoverPage — manual test steps

Colocated manual test steps for `src/pages/DiscoverPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## List states

Open in `Pages/Eciperay/DiscoverPage`: Loading,
LoadingMore.

1. The loading state is a centered Spinner (Center +
   Spinner) composed by the page: the spinner renders
   centered in its parent with its label; the state carries
   no padding or margin of its own — spacing around it is
   the parent's. The same composition renders directly at
   the foot of a list for the loading-more slot — check
   that rendering in `Pages/Eciperay/DiscoverPage`:
   LoadingMore, where the spinner follows the last card
   with the list's own gap.
2. A list's error state has no wrapper component: the page
   renders the Alert component directly — check in
   `Pages/Eciperay/DiscoverPage`: ErrorState, where the alert
   sits under the filter bar, flush to the parent's inset.

**Run when:** a catalog page's loading state (Discover,
Home, MealsHub, Recipes, ShoppingList, Tags), or a
changeset naming the list loading states.
