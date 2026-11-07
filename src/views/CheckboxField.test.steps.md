---
component: CheckboxField
run_when:
  - "src/views/CheckboxField.tsx, its stories, or a changeset naming CheckboxField."
---

# CheckboxField — manual test steps

Colocated manual test steps for `src/views/CheckboxField.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CheckboxField

Open in `Views/CheckboxField`: Default, WithDescription, Checked,
WithRichDescription, WithChildren, WithError.

1. WithRichDescription: rich (multi-element) description content
   renders under the label with normal text spacing — not clipped,
   not squeezed against the checkbox.
2. WithChildren: child content renders inside the field's frame,
   aligned with the label column.
3. WithError: the error message is visible, in the danger treatment,
   and the checkbox remains toggleable in the story.
4. Toggling in Default/Checked flips the check with no layout shift.

**Run when:** `src/views/CheckboxField.tsx`, its stories, or a
changeset naming CheckboxField.
