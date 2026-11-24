---
component: StackedButtonRow
run_when:
  - "src/widgets/actions/StackedButtonRow.tsx, its stories, the pages that compose StackedButtonRow (LandingPage), or a changeset naming StackedButtonRow."
---

# StackedButtonRow — manual test steps

Colocated manual test steps for `src/widgets/actions/StackedButtonRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## StackedButtonRow

Open in `Widgets/StackedButtonRow`: Default.

A StackedButtonRow is a call-to-action row that stacks narrow and rows on wide.

1. The three buttons render centered with a 12px gap — stacked in a column on native and in a row on web (LandingPage's CTA row is the live case).

**Run when:** `src/widgets/actions/StackedButtonRow.tsx`, its stories,
the pages that compose StackedButtonRow (LandingPage), or a changeset
naming StackedButtonRow.
