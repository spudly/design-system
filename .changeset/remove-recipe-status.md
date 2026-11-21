---
"@spudly/ui": major
---

Remove recipe status from RecipeFormPage and PublicRecipePage: the form page no longer takes `statusOptions`, `status`, or `onStatusChange` and renders no status picker, and the public page's overview no longer takes `status` or renders a status badge. RecipeOverviewPanel's `statusTone`/`statusLabel` are now optional — the badge renders only when a caller supplies a status label.
