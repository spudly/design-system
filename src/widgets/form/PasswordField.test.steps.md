---
component: PasswordField
run_when:
  - "src/widgets/form/PasswordField.tsx, its stories, the auth forms that compose it (SignInForm, SignUpForm, ResetPasswordForm), or a changeset naming PasswordField."
---

# PasswordField — manual test steps

Colocated manual test steps for `src/widgets/form/PasswordField.tsx` (design-system #758).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Concealed and revealed states

Open in `Widgets/Form/PasswordField`: Concealed, Revealed.

1. Concealed: the password value renders masked, the field's
   right edge carries an eye toggle, and the toggle's accessible
   name is the show-password label. Pressing the toggle reveals
   the typed value in plain text without clearing or re-typing
   it, and the toggle's accessible name switches to the
   hide-password label with the eye-off glyph.
2. Revealed: the same field starts with the value in plain text
   and the eye-off toggle showing; pressing it masks the value
   again. Focus order is field first, then the toggle, in both
   states.

**Run when:** `src/widgets/form/PasswordField.tsx`, its stories,
the auth forms that compose it (SignInForm, SignUpForm,
ResetPasswordForm), or a changeset naming PasswordField.
