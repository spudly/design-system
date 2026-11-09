---
component: MealDetailPage
run_when:
  - "src/widgets/ListStack.tsx, its stories, the pages that compose ListStack (MealPlanDetailPage, MealDetailPage), or a changeset naming ListStack."
  - "any of the five pages' sources or stories, or a changeset naming any of them. Run only the numbered cases for the page(s) that changed. (namely: MealDetailPage, MealsHubPage, ShoppingListPage, HomePage, MealCookingModePage)"
---

# MealDetailPage — manual test steps

Colocated manual test steps for `src/pages/MealDetailPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ListStack

Open in `Widgets/ListStack`: Default.

A ListStack composes hairline rows as one continuous list; the
stack adds no gap of its own — the rows own their separation.

1. The three rows read as one ruled surface: hairlines run
   continuously from row to row with no gaps of card background
   between them, and the third row shows the disabled treatment
   (MealPlanDetailPage's Entries card and MealDetailPage's
   Recipes card are the live cases).

**Run when:** `src/widgets/ListStack.tsx`, its stories, the
pages that compose ListStack (MealPlanDetailPage,
MealDetailPage), or a changeset naming ListStack.

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
3. ShoppingListPage Default: each line's box, medium-weight
   (500) name, and muted quantity / "optional" segments
   render on one line;
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
   Done button below it. This check verifies the Done
   button's presence only: the story's `onDone` is a no-op,
   so pressing it does not leave the error state in
   Storybook.

**Run when:** any of the five pages' sources or stories, or a
changeset naming any of them. Run only the numbered cases for
the page(s) that changed.
