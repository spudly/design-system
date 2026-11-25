---
component: TrailingActionsRow
run_when:
  - "src/widgets/layout/Col.tsx, src/widgets/actions/TrailingActionsRow.tsx, src/widgets/layout/Card.tsx, their stories, TagsPage's forms or rows, or a changeset naming any of them. (namely: Col, TrailingActionsRow, Card, TagsPage)"
---

# TrailingActionsRow — manual test steps

Colocated manual test steps for `src/widgets/actions/TrailingActionsRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Form Col & TrailingActionsRow; Card's compact variant

Open in `Pages/Eciperay/TagsPage` (its tag form);
`Widgets/TrailingActionsRow`: FieldAndAction,
ContentAndGhostButtons, Narrow; `Widgets/Card`: Compact.

1. Form Col: the form's fields stack at an even 12px rhythm
   with the button row last.
2. TrailingActionsRow FieldAndAction: the leading group sits
   at the left and the action at the right on one line.
   ContentAndGhostButtons: the badge sits left, Edit / Delete
   right, at a 12px gap between the actions. Narrow: when the
   groups cannot fit, the action wraps below the leading group
   instead of overflowing.
3. Card Compact: the surface is the small card treatment —
   12px padding, medium corners, small shadow, no border (the
   former CompactCard, folded into Card as `variant="compact"`
   under Stephen's 2026-10-29 ruling).

**Run when:** `src/widgets/layout/Col.tsx`,
`src/widgets/actions/TrailingActionsRow.tsx`,
`src/widgets/layout/Card.tsx`, their stories, TagsPage's
forms or rows, or a changeset naming any of them.
