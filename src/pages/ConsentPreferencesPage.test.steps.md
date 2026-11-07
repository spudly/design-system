---
component: ConsentPreferencesPage
run_when:
  - src/pages/ConsentPreferencesPage.tsx, its stories, or a changeset naming ConsentPreferencesPage.
---

# ConsentPreferencesPage — manual test steps

Colocated manual test steps for `src/pages/ConsentPreferencesPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ConsentPreferencesPage

Open in `Pages/Eciperay/ConsentPreferencesPage`: Accepted,
NotSet.

1. Accepted: the current-choice line reads "Your current
   choice: Accepted"; NotSet reads "Not set". Accept / Decline
   / Withdraw render in one row under the choice line, with
   the withdraw hint under the row.

**Run when:** `src/pages/ConsentPreferencesPage.tsx`, its
stories, or a changeset naming ConsentPreferencesPage.
