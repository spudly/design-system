---
component: AccountDataView
run_when:
  - src/views/AccountDataView.tsx, its stories, ProfilePage, or a changeset naming AccountDataView.
---

# AccountDataView — manual test steps

Colocated manual test steps for `src/views/AccountDataView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## AccountDataView

Open in `Views/AccountDataView`: Default, WithError.

1. Default: the hint line and the Download my data / Delete
   account row render on the elevated card, Delete in the
   danger treatment. WithError adds the error line under the
   buttons.

**Run when:** `src/views/AccountDataView.tsx`, its stories,
ProfilePage, or a changeset naming AccountDataView.
