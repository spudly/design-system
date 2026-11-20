---
component: CheckboxField
run_when:
  - "src/widgets/CheckboxField.tsx, its stories, or a changeset naming CheckboxField."
---

# CheckboxField — manual test steps

Colocated manual test steps for `src/widgets/CheckboxField.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CheckboxField

Open in `Widgets/CheckboxField`: Default, WithDescription, Checked,
WithRichDescription, WithChildren, WithError, ListShape,
ListShapeChecked, ListShapeWrappedLabel.

1. WithRichDescription: rich (multi-element) description content
   renders under the label with normal text spacing — not clipped,
   not squeezed against the checkbox.
2. WithChildren: child content renders below the checkbox
   row, at the field frame's left edge — not indented to
   the label column.
3. WithError: the error message is visible, in the danger treatment,
   and the checkbox remains toggleable in the story.
4. Toggling in Default/Checked flips the check with no layout shift.
   In every story the box stays unfilled in both states with a
   primary-colored outline in both states; checking shows a
   primary-colored check glyph inside the still-unfilled box.
5. ListShape: an unfilled outlined box sits left of a
   medium-weight (500) label with its muted detail
   ("2 tbsp · optional") on the same line, over a hairline; the
   whole row is the press target and toggling flips the check.
   ListShapeChecked: the label renders muted and struck through
   (the opt-in `strikeWhenChecked` treatment).
6. ListShapeWrappedLabel: the label wraps to multiple lines and
   the box stays aligned to the label's first line — it does not
   center against the whole wrapped block or drift off the
   first line.

**Run when:** `src/widgets/CheckboxField.tsx`, its stories, or a
changeset naming CheckboxField.
