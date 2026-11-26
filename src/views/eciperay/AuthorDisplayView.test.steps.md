---
component: AuthorDisplayView
run_when:
  - "src/views/eciperay/AuthorDisplayView.tsx, its stories, ProfilePage, or a changeset naming AuthorDisplayView."
---

# AuthorDisplayView — manual test steps

Colocated manual test steps for `src/views/eciperay/AuthorDisplayView.tsx` (design-system #873).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## AuthorDisplayView

Open in `Views/Eciperay/AuthorDisplayView`: Named, Hidden,
WithError.

1. Named: the Display name field carries the current name, the
   hint line renders under it, the show-my-name checkbox is
   checked, and the Save author display button renders.
2. Hidden: the checkbox is unchecked and the name field is
   empty with its placeholder showing.
3. WithError: the error alert renders above the Save button.

**Run when:** `src/views/eciperay/AuthorDisplayView.tsx`, its
stories, ProfilePage, or a changeset naming AuthorDisplayView.
