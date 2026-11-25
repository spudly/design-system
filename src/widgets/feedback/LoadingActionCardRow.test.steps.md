---
component: LoadingActionCardRow
run_when:
  - "src/widgets/feedback/LoadingActionCardRow.tsx, its stories, the pages that compose LoadingActionCardRow (MealsHubPage), or a changeset naming LoadingActionCardRow."
---

# LoadingActionCardRow — manual test steps

Colocated manual test steps for `src/widgets/feedback/LoadingActionCardRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LoadingActionCardRow

Open in `Widgets/LoadingActionCardRow`: Default.

A LoadingActionCardRow is a loading row in the TextActionCardRow shape: title and subtitle bones in an elevated card beside an inert ghost action bone.

1. The three rows render as elevated cards holding a medium bone over a small bone, flexing beside an inert ghost Delete bone (MealsHubPage's loading meals list is the live case), and the bones mirror the loaded TextActionCardRow's title, subtitle, and Delete action.

**Run when:** `src/widgets/feedback/LoadingActionCardRow.tsx`, its stories,
the pages that compose LoadingActionCardRow (MealsHubPage), or a changeset
naming LoadingActionCardRow.
