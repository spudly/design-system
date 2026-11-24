---
component: EqualColumns
run_when:
  - "src/widgets/form/EqualColumns.tsx, its stories, RecipeFormPage, or a changeset naming EqualColumns."
---

# EqualColumns — manual test steps

Colocated manual test steps for `src/widgets/form/EqualColumns.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## EqualColumns

Open in `Widgets/Form/EqualColumns`: Default.

1. Servings, Prep (min), and Cook (min) fields sit in three
   equal-width columns with an even gutter between them;
   each label sits over its own field.

**Run when:** `src/widgets/form/EqualColumns.tsx`, its
stories, RecipeFormPage, or a changeset naming EqualColumns.
