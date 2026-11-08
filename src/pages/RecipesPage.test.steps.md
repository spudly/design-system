---
component: RecipesPage
run_when:
  - "a catalog page's loading or error state (Discover, Home, MealsHub, Recipes, ShoppingList, Tags), or a changeset naming the list loading or error states."
  - "src/pages/RecipesPage.tsx (including its page-local row and log-cook control compositions), its stories, or a changeset naming RecipesPage or the Shared-with-me screen."
---

# RecipesPage — manual test steps

Colocated manual test steps for `src/pages/RecipesPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## List states

Open in `Pages/Eciperay/DiscoverPage`: Loading,
LoadingMore.

1. The loading state is a centered Spinner (Center +
   Spinner) composed by the page: the spinner renders
   centered in its parent with its label as its accessible name (verify the rendered element's `aria-label` or the accessibility tree — the label is not displayed as visible text); the state carries
   no padding or margin of its own — spacing around it is
   the parent's. The same composition renders directly at
   the foot of a list for the loading-more slot — check
   that rendering in `Pages/Eciperay/DiscoverPage`:
   LoadingMore, where the spinner follows the last card
   directly — the list's separator renders only between
   cards, so no gap follows the last card.
2. A list's error state has no wrapper component: the page
   renders the Alert component directly — check in
   `Pages/Eciperay/DiscoverPage`: ErrorState, where the alert
   sits under the filter bar, flush to the parent's inset.

**Run when:** a catalog page's loading or error state
(Discover, Home, MealsHub, Recipes, ShoppingList, Tags), or
a changeset naming the list loading or error states.

## RecipesPage

Open in `Pages/Eciperay/RecipesPage`: Default, Filtered, Empty,
Loading, LoadingMore, FilterChooserOpen, WithFiltersAdded,
ExpandedAccessory, OwnOnly, DiscoveryOnly, DiscoveryError.

Since #415 this is the unified "Recipes" browse: the user's own
material (created + shared-with-me) first under its heading,
then public discovery content under its heading, on one scroll
surface with ONE search field and ONE filter set above both
sections.

1. The **Filters button is exactly as tall as the search field**
   beside it — top and bottom edges align. There is exactly
   **one** search field and one Filters button on the page,
   above both section headings.
2. Default shows only the collapsed filter affordance (no full
   filter panel) until filters are added in WithFiltersAdded.
   FilterChooserOpen starts with the chooser open, displaying
   the available add-filter buttons (every filter not yet
   added). Filtered ("chicken") narrows BOTH sections
   with the one search: the own section lists its matching rows
   and the discovery section lists its matching card.
3. Default: own rows render first under "Your recipes", then
   discovery cards under "Discover" (preferred placement). The
   shared-with-me rows (Arroz con Pollo, Fudgy Brownies) carry
   the caller-supplied **"Shared with you" badge** under their
   subtitle; created rows carry no badge.
4. Section independence: DiscoveryOnly shows the own section
   collapsed to its empty state ("No recipes found.") under its
   heading — the section does **not** disappear — with the
   discovery cards below it; OwnOnly shows the own rows
   alone — the host omits the discovery props entirely, so
   no discovery heading or empty state renders at all;
   DiscoveryError shows the discovery error alert while the own
   rows above it render untouched.
5. Empty shows both sections' empty states under their
   headings; Loading shows a spinner row under each heading
   with no recipe rows in either section.
6. LoadingMore keeps the recipe rows rendered with the footer
   spinner below them (the next-page-in-flight state,
   `isFetchingNextPage`), like DiscoverPage's LoadingMore story.
7. Rows: each own row is an elevated card with a 64px cover-cropped
   thumbnail (or the gray placeholder well when the recipe has
   no image), a semibold title, and a hint subtitle. Both the
   thumbnail and the text are links to the recipe — the card
   itself is not pressable. Discovery rows are DiscoveryCards,
   each a real link to the recipe's permalink. At a narrow
   width the text block wraps under the thumbnail rather than
   collapsing beside it (the 60dp basis). ExpandedAccessory
   shows the accessory content under the card inside the same
   list item, 12px below it.
8. Log-cook control (own rows that allow cook logging only;
   discovery cards have none): a rated row's stars are one
   button with a 44dp target,
   filled by rounding (a 4.5 rating shows five amber stars),
   named "Log a cook of <title>, rated <N> out of 5 stars"; an
   unrated row shows a single gray star as the button, named
   "Log a cook of <title>". The control flows inline after the
   subtitle text, never as a trailing row item, and it hides
   on the row whose accessory is open. Rows whose data forbids
   cook logging render no control at all: in Default those are
   the shared rows — Fudgy Brownies (rated) and Arroz con Pollo
   (unrated), both badged "Shared with you" — which stay
   link-only, with no star button to check.

**Run when:** `src/pages/RecipesPage.tsx` (including its
page-local row and log-cook control compositions), its
stories, or a changeset naming RecipesPage or the
Shared-with-me screen.
