---
"@spudly/ui": minor
---

Rename the MultilineField component to TextAreaField (the old `MultilineField` / `MultilineFieldProps` exports are removed; update imports to `TextAreaField` / `TextAreaFieldProps` on bump). The component itself is unchanged — same label, error, and `numberOfLines` behavior — and every design-system page that used it now uses TextAreaField: AiSessionPage, FeedbackPage, ImportTextPage, MealFormPage, MealPlanFormPage, and RecipeFormPage, plus the CommentItem editor. On a @spudly/ui bump, re-test the multi-line text inputs on those pages and in comment editing.
