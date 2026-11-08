---
component: HomePage
run_when:
  - "src/widgets/ButtonStack.tsx, src/widgets/CenteredText.tsx, their stories, HomePage's header, or a changeset naming either."
  - "a catalog page's loading state (Discover, Home, MealsHub, Recipes, ShoppingList, Tags), or a changeset naming the list loading states."
  - "any of the five pages' sources or stories, or a changeset naming any of them. Run only the numbered cases for the page(s) that changed. (namely: MealDetailPage, MealsHubPage, ShoppingListPage, HomePage, MealCookingModePage)"
  - "src/widgets/ButtonStack.tsx, its stories, HomePage's actions, or a changeset naming ButtonStack."
---

# HomePage — manual test steps

Colocated manual test steps for `src/pages/HomePage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ButtonStack & CenteredText

Open in `Widgets/ButtonStack`: Default;
`Widgets/CenteredText`: Default.

1. ButtonStack: the three buttons stretch full width at an
   even 12px rhythm.
2. CenteredText: the subtitle line centers (each wrapped line
   centered) in the muted ink; the plain line centers in the
   default ink.

**Run when:** `src/widgets/ButtonStack.tsx`,
`src/widgets/CenteredText.tsx`, their stories, HomePage's
header, or a changeset naming either.

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
   directly — the list's separator renders only between
   cards, so no gap follows the last card.
2. A list's error state has no wrapper component: the page
   renders the Alert component directly — check in
   `Pages/Eciperay/DiscoverPage`: ErrorState, where the alert
   sits under the filter bar, flush to the parent's inset.

**Run when:** a catalog page's loading state (Discover,
Home, MealsHub, Recipes, ShoppingList, Tags), or a
changeset naming the list loading states.

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
5. MealCookingModePage: the dark overlay covers the frame —
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

## ButtonStack

Open in `Widgets/ButtonStack`: Default.

1. The three buttons stretch full width at an even 12px
   rhythm.

**Run when:** `src/widgets/ButtonStack.tsx`, its
stories, HomePage's actions, or a changeset naming
ButtonStack.
