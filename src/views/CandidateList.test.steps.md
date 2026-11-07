---
component: CandidateList
run_when:
  - src/views/CandidateList.tsx, its stories, or a changeset naming CandidateList.
---

# CandidateList — manual test steps

Colocated manual test steps for `src/views/CandidateList.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CandidateList

Open in `Views/CandidateList`: Default, Pending,
ReadOnly.

1. Default: the heading sits over one tinted card per
   candidate, each card carrying the candidate's label and
   its Activate button; each button's accessible name
   includes its candidate ("Activate Pea soup").
2. Pending: the Activate button renders disabled while the
   activation is in flight.
3. ReadOnly: the cards render their labels with no Activate
   button — candidate data alone exposes no dead action.

**Run when:** `src/views/CandidateList.tsx`, its
stories, or a changeset naming CandidateList.
