---
component: BadgeCardRow
run_when:
  - "src/widgets/BadgeCardRow.tsx, its stories, TagsPage's rows, or a changeset naming BadgeCardRow."
---

# BadgeCardRow — manual test steps

Colocated manual test steps for `src/widgets/BadgeCardRow.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## BadgeCardRow

Open in `Widgets/BadgeCardRow`: Default, DeleteOnly.

1. Default: a compact card (small padding and shadow) with
   the colored badge at the left and Edit / Delete as bare
   text actions at the right, Delete in the error treatment.
2. DeleteOnly: only the Delete action shows; the badge is
   the blue Freezer badge (Default's Weeknight badge is
   green — that color difference is the stories' data, not
   a regression) and the row height is unchanged.

**Run when:** `src/widgets/BadgeCardRow.tsx`, its
stories, TagsPage's rows, or a changeset naming
BadgeCardRow.
