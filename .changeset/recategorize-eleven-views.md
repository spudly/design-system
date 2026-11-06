---
"@spudly/ui": patch
---

Internal reorganization (#470): CandidateList, CatalogFiltersBar, CatalogHeader, ChangedListBanner, ChunkErrorBoundary, ForgotPasswordForm, LegalSection, ResetPasswordForm, RevertAction, SignInForm, and SignUpForm are now categorized as views instead of widget components. Testable terms: in Storybook these eleven units appear under the Views grouping (for example Views/SignInForm and Views/CatalogFiltersBar) instead of the Components grouping; every page that composes them renders and behaves exactly as before, and the package's public surface is unchanged — ChunkErrorBoundary remains exported from the package root.
