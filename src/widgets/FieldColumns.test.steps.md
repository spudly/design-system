---
component: FieldColumns
run_when:
  - "src/widgets/FieldColumns.tsx, its stories, RecipeFormPage, or a changeset naming FieldColumns."
---

# FieldColumns — manual test steps

Colocated manual test steps for `src/widgets/FieldColumns.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FieldColumns

Open in `Widgets/FieldColumns`: Default.

1. Servings, Prep (min), and Cook (min) fields sit in three
   equal-width columns with an even gutter between them;
   each label sits over its own field.

**Run when:** `src/widgets/FieldColumns.tsx`, its
stories, RecipeFormPage, or a changeset naming FieldColumns.
