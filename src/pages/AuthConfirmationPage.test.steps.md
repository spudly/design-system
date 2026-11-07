---
component: AuthConfirmationPage
run_when:
  - src/pages/AuthConfirmationPage.tsx, its stories, or a changeset naming AuthConfirmationPage.
---

# AuthConfirmationPage — manual test steps

Colocated manual test steps for `src/pages/AuthConfirmationPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## AuthConfirmationPage

Open in `Pages/Eciperay/AuthConfirmationPage`: CheckYourEmail,
WithoutBackLink.

1. CheckYourEmail: title, muted body, and the "Back to sign in"
   link render in the auth shell; the link is a real anchor
   carrying its href. WithoutBackLink renders no link.

**Run when:** `src/pages/AuthConfirmationPage.tsx`, its
stories, or a changeset naming AuthConfirmationPage.
