---
component: LoadingCardRow
run_when:
  - "src/widgets/feedback/LoadingCardRow.tsx, its stories, the pages that compose LoadingCardRow (HomePage), or a changeset naming LoadingCardRow."
---

# LoadingCardRow — manual test steps

Colocated manual test steps for `src/widgets/feedback/LoadingCardRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LoadingCardRow

Open in `Widgets/LoadingCardRow`: Default.

A LoadingCardRow is a card list's loading row: a card holding a
medium title bone over a small subtitle bone.

1. The three rows render as cards with a medium bone over a
   small bone inside each, separated by 12px below each card
   (HomePage's loading recipe list is the live case), and the
   bones mirror the loaded card rows' text sizes.

**Run when:** `src/widgets/feedback/LoadingCardRow.tsx`, its stories,
the pages that compose LoadingCardRow (HomePage), or a
changeset naming LoadingCardRow.
