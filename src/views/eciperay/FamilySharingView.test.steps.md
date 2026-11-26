---
component: FamilySharingView
run_when:
  - "src/views/eciperay/FamilySharingView.tsx, its stories, ProfilePage, or a changeset naming FamilySharingView."
---

# FamilySharingView — manual test steps

Colocated manual test steps for `src/views/eciperay/FamilySharingView.tsx` (design-system #873).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FamilySharingView

Open in `Views/Eciperay/FamilySharingView`: WithGrants, Empty,
LoadingList, WithError.

1. WithGrants: the explainer renders, each grant row shows its
   "Name (email)" label (email alone when unnamed), its Added
   date line, and a Remove button; the Add button is disabled
   while the email field is empty.
2. Empty: the empty message renders instead of grant rows.
3. LoadingList: the loading line renders and no empty message
   shows.
4. WithError: the error alert renders under the Add button.

**Run when:** `src/views/eciperay/FamilySharingView.tsx`, its
stories, ProfilePage, or a changeset naming FamilySharingView.
