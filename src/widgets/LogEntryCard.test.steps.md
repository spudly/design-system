---
component: LogEntryCard
run_when:
  - src/widgets/LogEntryCard.tsx, its stories, or a changeset naming LogEntryCard.
---

# LogEntryCard — manual test steps

Colocated manual test steps for `src/widgets/LogEntryCard.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LogEntryCard

Open in `Widgets/LogEntryCard`: Default, WithoutAction.

1. Default: the date and the star rating head the card, the
   notes body follows, and the Delete action sits below,
   carrying its entry-specific accessible name (position +
   date, composed by the caller).
2. WithoutAction: the card renders its date and rating with
   no Delete action.

**Run when:** `src/widgets/LogEntryCard.tsx`, its
stories, or a changeset naming LogEntryCard.
