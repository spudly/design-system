---
component: RouteErrorPage
run_when:
  - "src/pages/eciperay/RouteErrorPage.tsx, its stories, or a changeset naming RouteErrorPage."
---

# RouteErrorPage — manual test steps

Colocated manual test steps for `src/pages/eciperay/RouteErrorPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RouteErrorPage

Open in `Pages/Eciperay/RouteErrorPage`: NotFound, ErrorState, WithAction.

1. NotFound reads "Page not found" and ErrorState reads
   "Something went wrong", each with its own message and the
   "Go to the home page" link as a real anchor.
2. WithAction (#765): a "Try again" button renders beside the
   home link; activating it fires the host's retry callback.
   NotFound and ErrorState (no action supplied) render no
   button.

**Run when:** `src/pages/eciperay/RouteErrorPage.tsx`, its stories, or
a changeset naming RouteErrorPage.
