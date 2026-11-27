---
"@spudly/ui": minor
---

MealPlanFormPage renders a skeleton loading state (#874, following the #278 pattern), so hosts can mount the meal plan form before the plan it edits resolves instead of gating the screen on a spinner. MealPlanFormPage gains an optional `loading` prop: while loading, it renders bones in the form's at-rest shape — the heading line, the title / starts-on / ends-on fields' label-and-input stacks, the notes area as one tall box, the entry picker's box when the entries section would render, and the submit button's box — and no controls render. MealPlanFormPage gains a `Loading` story pinning the state. Verify after adopting: passing `loading` to MealPlanFormPage shows the form as skeleton bones with no fields, picker, or buttons, and omitting it renders the form exactly as before. This is a partial tranche of #874 — the remaining pages without skeleton states are inventoried in the pull request's audit table and follow in a later tranche.
