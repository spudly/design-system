---
"@spudly/ui": patch
---

FormSubmit is removed. The meal and meal-plan forms' Save button now sits at the forms' standard 16px separation — the same spacing the recipe form's submit button already used — instead of 32px below the last field. Test: open Pages/Eciperay/MealFormPage (Default, NoSelection, SaveError) and Pages/Eciperay/MealPlanFormPage (Default, NoSelection) in Storybook and confirm each Save button renders full-width at the standard separation below the last field, with its disabled states and the SaveError line above the submit row unchanged.
