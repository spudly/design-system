---
component: MealsHubPage
run_when:
  - "src/widgets/TextActionCardRow.tsx, its stories, MealsHubPage's meal list, or a changeset naming TextActionCardRow."
  - "src/widgets/PinnedHeaderShell.tsx, its stories, MealsHubPage's plans tab, or a changeset naming PinnedHeaderShell."
  - "a catalog page's loading or error state (Discover, Home, MealsHub, Recipes, ShoppingList, Tags), or a changeset naming the list loading or error states."
  - "any of the five pages' sources or stories, or a changeset naming any of them. Run only the numbered cases for the page(s) that changed. (namely: MealDetailPage, MealsHubPage, ShoppingListPage, HomePage, MealCookingModePage)"
---

# MealsHubPage — manual test steps

Colocated manual test steps for `src/pages/MealsHubPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## TextActionCardRow

Open in `Widgets/TextActionCardRow`: Default, TitleOnly.

1. Default: an elevated card with the title in semibold over
   its muted subtitle; the text block is a link (anchor on
   web) and "Delete" sits at the right edge as bare text —
   pressing Delete does not navigate.
2. TitleOnly: the card shows the title alone, no subtitle line
   and no empty gap where it would sit.

**Run when:** `src/widgets/TextActionCardRow.tsx`, its
stories, MealsHubPage's meal list, or a changeset naming
TextActionCardRow.

## PinnedHeaderShell

Open in `Widgets/PinnedHeaderShell`: Default.

1. The header block (title over the tab bar) stays pinned at
   the top on the light page background while the content
   region below it scrolls; the header's inset matches the
   page inset (16px sides and top).

**Run when:** `src/widgets/PinnedHeaderShell.tsx`, its
stories, MealsHubPage's plans tab, or a changeset naming
PinnedHeaderShell.

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

## Meals & planning pages (MealDetailPage, MealsHubPage, ShoppingListPage, HomePage, MealCookingModePage)

Open in `Pages/Eciperay/MealDetailPage`: Default,
NoNotesOrNutrition; `Pages/Eciperay/MealsHubPage`: Default,
PlansTab, Empty; `Pages/Eciperay/ShoppingListPage`: Default,
Loading, Empty; `Pages/Eciperay/HomePage`: WithRecipes, Empty,
Loading; `Pages/Eciperay/MealCookingModePage`: Default,
FirstStep, LastStep, LoadError.

1. MealDetailPage Default: xl bold title, muted notes and
   nutrition lines, Cook meal / Edit side by side, then the
   Recipes card whose member rows link (title over its meta
   line); an unavailable member would show its
   " (unavailable)" suffix and not link. NoNotesOrNutrition
   drops the two muted lines with no leftover gaps.
2. MealsHubPage Default: Meals title over the tab bar, the
   full-width New meal button, then meal cards at an even 8px
   rhythm, each card's Delete a bare text action at its right
   edge. PlansTab: the same chrome stays pinned above the
   plans list. Empty: the empty state replaces the list.
3. ShoppingListPage Default: each line's box, bold name, and
   muted quantity / "optional" segments render on one line;
   checking a line fills its box and strikes the line through.
   Loading shows the spinner under the title; Empty shows the
   empty state.
4. HomePage WithRecipes: hero title, centered muted subtitle,
   three full-width buttons, then the section title over the
   host-rendered rows at the rows' own rhythm. Loading centers
   the spinner under the section title; Empty centers the
   empty message there.
5. MealCookingModePage: the dark overlay covers only the content region above the footer (the footer remains reachable and is not covered) —
   uppercase meal title and "Step N of M · recipe" eyebrows
   over the step body, Done pill at the top right, dots and
   Back / Next below. FirstStep has no Back; LastStep disables
   Next.
6. MealCookingModePage LoadError: no overlay and no step UI —
   the meal title over an error alert reading "Couldn't load
   the cook plan for this meal. Please try again.", with a
   Done button below it as the way out.

**Run when:** any of the five pages' sources or stories, or a
changeset naming any of them. Run only the numbered cases for
the page(s) that changed.
