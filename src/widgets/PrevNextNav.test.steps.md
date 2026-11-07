---
component: PrevNextNav
run_when:
  - src/widgets/PrevNextNav.tsx, its stories, or a changeset naming PrevNextNav.
---

# PrevNextNav — manual test steps

Colocated manual test steps for `src/widgets/PrevNextNav.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## PrevNextNav

Open in `Widgets/PrevNextNav`: Both, CustomLabels, NextOnly,
NextDisabled, BackDisabled.

1. BackDisabled: the Back button is hidden or visibly disabled (per
   the story) while Next stays active and right-aligned as in
   NextOnly.
2. NextDisabled: Next reads as disabled; Back remains usable.
3. CustomLabels render verbatim with no truncation at story width.

**Run when:** `src/widgets/PrevNextNav.tsx`, its stories, or a
changeset naming PrevNextNav.
