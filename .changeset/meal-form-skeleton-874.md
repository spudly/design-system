---
"@spudly/ui": minor
---

MealFormPage renders a skeleton loading state (#874, following the #278 pattern), so hosts can mount the meal form before the meal it edits resolves instead of gating the screen on a spinner. MealFormPage gains an optional `loading` prop: while loading, it renders bones in the form's at-rest shape — the heading line, the title field's label-and-input stack, the notes area as one tall box, the recipe picker's box, and the submit button's box — and no controls render. MealFormPage gains a `Loading` story pinning the state. Verify after adopting: passing `loading` to MealFormPage shows the form as skeleton bones with no fields, picker, steppers, or buttons, and omitting it renders the form exactly as before. This is a partial tranche of #874 — the remaining pages without skeleton states are inventoried in the pull request's audit table and follow in a later tranche.
