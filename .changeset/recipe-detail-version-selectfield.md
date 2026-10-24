---
"@spudly/ui": patch
---

RecipeDetailPage: replace the version selector with SelectField (#72). The custom bottom-sheet widget — whose options appeared at the bottom of the screen, unlike every other select in the system — is gone; the picker now renders the standard SelectField labeled "Version". No contract change: the same version list (newest first), the same selected-version fallback, and the same `onSelectVersion` callback, and the single-version case still collapses to static version text.
