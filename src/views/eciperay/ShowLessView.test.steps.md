---
component: ShowLessView
run_when:
  - "src/views/eciperay/ShowLessView.tsx, its stories, ProfilePage, or a changeset naming ShowLessView."
---

# ShowLessView — manual test steps

Colocated manual test steps for `src/views/eciperay/ShowLessView.tsx` (design-system #873).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ShowLessView

Open in `Views/Eciperay/ShowLessView`: WithEntries, Empty,
LoadingList, LoadFailed.

1. WithEntries: the description renders and each entry row
   shows its recipe title with an Undo button.
2. Empty: the empty message renders instead of entry rows.
3. LoadingList: the loading line renders and no empty message
   shows.
4. LoadFailed: the load-failed error alert renders and no
   empty message shows (the list is unknown, not empty).

**Run when:** `src/views/eciperay/ShowLessView.tsx`, its
stories, ProfilePage, or a changeset naming ShowLessView.
