---
component: MealFormPage
run_when:
  - "src/pages/eciperay/RecipeFormPage.tsx, src/pages/eciperay/MealFormPage.tsx, src/pages/eciperay/MealPlanFormPage.tsx, src/widgets/form/AutocompletePicker.tsx, their stories, or a changeset naming any of the three pages or AutocompletePicker. Run only the numbered cases for the page(s) that changed; an AutocompletePicker-only change runs only the autocomplete portions of cases 4 and 5."
---

# MealFormPage — manual test steps

Colocated manual test steps for `src/pages/eciperay/MealFormPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeFormPage, MealFormPage & MealPlanFormPage

Open in `Pages/Eciperay/RecipeFormPage`: Default, Empty,
ContentLocked, VersionDiff. Open in `Pages/Eciperay/MealFormPage`:
Default, NoSelection, SaveError, Loading. Open in
`Pages/Eciperay/MealPlanFormPage`: Default, NoSelection.

1. RecipeFormPage Default: Title, the Status toggle buttons,
   Description with its "Generate with AI" action, the Servings
   / Prep / Cook fields in one equal-width EqualColumns row,
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
   removable list, and Servings to cook and Servings to eat steppers per selected recipe (#659);
   selecting the result adds it and the picker stays available
   to add more, Remove drops a selected recipe, and a search
   with no matches shows "No recipes found." NoSelection
   disables Save meal; SaveError shows the error line above
   the submit row.
5. MealPlanFormPage Default: the plan-title heading, the Starts
   on / Ends on fields, the entry search autocomplete with kind
   prefixes on its results and selected entries, and quantity
   (plus Servings to cook and Servings to eat for recipes, #659) steppers grouped per selected
   entry in their own field stacks; NoSelection disables Save
   plan.
6. MealFormPage Loading (#874): the form renders as skeleton
   bones in its at-rest shape — the heading line, the Title
   field's label-and-input stack, the notes area as one tall
   box, the recipe picker's box, and the Save meal button's
   box — and no fields, picker, steppers, or buttons render.

**Run when:** `src/pages/eciperay/RecipeFormPage.tsx`,
`src/pages/eciperay/MealFormPage.tsx`, `src/pages/eciperay/MealPlanFormPage.tsx`,
`src/widgets/form/AutocompletePicker.tsx`, their stories, or a
changeset naming any of the three pages or
AutocompletePicker. Run only the numbered cases for the
page(s) that changed; an AutocompletePicker-only change
runs only the autocomplete portions of cases 4 and 5.
