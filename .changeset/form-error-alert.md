---
"@spudly/ui": patch
---

Form-level errors are now announced to screen readers: every form-level error line that previously rendered as plain error text now renders through Alert with error severity (assertive alert role). Affected components: NutritionGoalsForm, SignInForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm, AccessTokensPanel. Affected pages: AiSessionPage, FeedbackPage, ImportImagePage, ImportReviewPage, ImportTextPage, ImportUrlPage, MealFormPage, MealPlanFormPage, RecipeFormPage (its submit error). The error now appears in Alert's bordered error box instead of a plain red text line. Field-level errors are unchanged. On a @spudly/ui bump, re-check in Storybook: submit one of the auth forms (e.g. Components/SignInForm) or NutritionGoalsForm with a failing host error and confirm the error shows in the Alert box and is announced; confirm a field-level error still renders as the small error line under its field.
