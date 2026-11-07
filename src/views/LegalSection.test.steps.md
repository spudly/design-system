---
component: LegalSection
run_when:
  - src/views/SignInForm.tsx, src/views/SignUpForm.tsx, src/views/ForgotPasswordForm.tsx, src/views/ResetPasswordForm.tsx, src/views/LegalSection.tsx, their stories, the auth or Profile pages that compose them, or a changeset naming the auth forms or LegalSection.
---

# LegalSection — manual test steps

Colocated manual test steps for `src/views/LegalSection.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Auth forms (SignInForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm) & LegalSection

Open in `Views/SignInForm`, `Views/SignUpForm`,
`Views/ForgotPasswordForm`, `Views/ResetPasswordForm`,
`Views/LegalSection` (each form's Default story — the
stories are interactive: fields can be typed in).

The auth pages' forms as standalone components: each form
composes the shared FormStack (which owns the 16px field
rhythm) and its own footer layout, and the pages compose the
forms.

1. Each form's fields stack at a 16px rhythm, and an error (the
   WithError story) renders directly above the submit button in
   the error treatment.
2. In SignInForm's Default story, both footer links render
   under the submit button at a tighter 8px separation:
   "Create an account" in the link color and "Forgot password?"
   in the muted treatment. In the WithoutLinks story neither
   link renders and the form ends at the submit button.
3. In SignUpForm's Default story, the legal notice under the
   submit button and the centered "Already have an account?
   Sign in" link below it read as one centered footer block.
4. In ForgotPasswordForm's Default story, the muted "Back to
   sign in" link renders under the submit button.
5. In LegalSection's Default story, the "Legal" title (large,
   semibold) sits 12px above the two links, which stack 12px
   apart — the Profile page's legal block.

**Run when:** `src/views/SignInForm.tsx`,
`src/views/SignUpForm.tsx`,
`src/views/ForgotPasswordForm.tsx`,
`src/views/ResetPasswordForm.tsx`,
`src/views/LegalSection.tsx`, their stories, the auth or
Profile pages that compose them, or a changeset naming the
auth forms or LegalSection.
