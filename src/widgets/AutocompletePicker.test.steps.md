---
component: AutocompletePicker
run_when:
  - "src/pages/RecipeFormPage.tsx, src/pages/MealFormPage.tsx, src/pages/MealPlanFormPage.tsx, src/widgets/AutocompletePicker.tsx, their stories, or a changeset naming any of the three pages or AutocompletePicker."
  - "src/widgets/AutocompletePicker.tsx, its stories, or a changeset naming AutocompletePicker."
---

# AutocompletePicker — manual test steps

Colocated manual test steps for `src/widgets/AutocompletePicker.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeFormPage, MealFormPage & MealPlanFormPage

Open in `Pages/Eciperay/RecipeFormPage`: Default, Empty,
ContentLocked, VersionDiff. Open in `Pages/Eciperay/MealFormPage`:
Default, NoSelection, SaveError. Open in
`Pages/Eciperay/MealPlanFormPage`: Default, NoSelection.

1. RecipeFormPage Default: Title, the Status toggle buttons,
   Description with its "Generate with AI" action, the Servings
   / Prep / Cook fields in one equal-width FieldColumns row,
   image, Source URL, the selectable Tag badges, the
   Ingredients and Instructions slots, and the
   full-width Create Recipe button, evenly spaced in one
   scrolling form. On web, clicking a field label (Title,
   Description, Servings, Prep, Cook, Source URL) focuses its
   input.
2. ContentLocked: the lock notice renders in place of the
   Ingredients and Instructions slots — the slots disappear —
   while the scalar fields and tags remain editable.
3. VersionDiff: the ingredients and instructions changed-list
   banners render above their slots with Revert actions, and
   changed fields carry their revert actions beside the labels.
4. MealFormPage Default: the meal-title heading, fields, the
   recipe search autocomplete (#383) — the search field (opened
   mid-search, "peppers") with the matching recipe as a result
   row carrying its servings, the selected recipes as a
   removable list, and a servings stepper per selected recipe;
   selecting the result adds it and the picker stays available
   to add more, Remove drops a selected recipe, and a search
   with no matches shows "No recipes found." NoSelection
   disables Save meal; SaveError shows the error line above
   the submit row.
5. MealPlanFormPage Default: the plan-title heading, the Starts
   on / Ends on fields, the entry search autocomplete with kind
   prefixes on its results and selected entries, and quantity
   (plus servings for recipes) steppers grouped per selected
   entry in their own field stacks; NoSelection disables Save
   plan.

**Run when:** `src/pages/RecipeFormPage.tsx`,
`src/pages/MealFormPage.tsx`, `src/pages/MealPlanFormPage.tsx`,
`src/widgets/AutocompletePicker.tsx`, their stories, or a
changeset naming any of the three pages or AutocompletePicker.

## AutocompletePicker

Open in `Widgets/AutocompletePicker`: WithResults,
NoSelection, Searching, NoResults.

1. WithResults: the search field (opened mid-search,
   "peppers") sits over the matching result row with its
   "6 servings" detail, and the already-selected recipe
   renders below as a row with a Remove action; pressing the
   result adds it to the selected list and the picker stays
   available to add more, and an already-selected result is
   not offered again.
2. Searching: a spinner replaces the results while the
   search is in flight — no stale result is selectable.
3. NoResults: a fruitless search shows "No results found."
   NoSelection: no selected list renders, and the empty
   search field shows no result area at all.

**Run when:** `src/widgets/AutocompletePicker.tsx`, its
stories, or a changeset naming AutocompletePicker.
