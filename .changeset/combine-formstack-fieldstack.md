---
"@spudly/ui": patch
---

FormStack is now the single form stack: FormStack and FieldStack are combined into one component with the 12px field rhythm and no extra bottom padding, so every form — auth forms, RecipeFormPage, MealFormPage, MealPlanFormPage, and TagsPage — stacks its fields and sections at the same even 12px rhythm. FieldStack is removed.
