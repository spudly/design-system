---
component: SignInPage
run_when:
  - "src/pages/SignInPage.tsx, src/pages/SignUpPage.tsx, src/pages/ForgotPasswordPage.tsx, src/pages/ResetPasswordPage.tsx, the form components they compose (src/views/SignInForm.tsx, src/views/SignUpForm.tsx, src/views/ForgotPasswordForm.tsx, src/views/ResetPasswordForm.tsx), their stories, or a changeset naming the auth pages or Enter-to-submit."
---

# SignInPage — manual test steps

Colocated manual test steps for `src/pages/SignInPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Auth pages (SignInPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage)

Open in `Pages/Eciperay/SignInPage`, `Pages/Eciperay/SignUpPage`,
`Pages/Eciperay/ForgotPasswordPage`,
`Pages/Eciperay/ResetPasswordPage` (the Filled story of each —
the stories are interactive: fields can be typed in, and a
submit switches the page to its loading state).

1. In every field of each page's Filled story, pressing Enter
   submits the page — visible as the page switching to its
   loading state (the submit button's label changes to its
   loading label, e.g. "Signing in…", and the button disables),
   the same result as pressing the submit button. This holds
   for the first field as well as the last.
2. In each page's Loading story (and in a Filled story after
   step 1 has put it in the loading state), pressing Enter in
   a field does not submit again — the page stays in the
   loading state with no further change.
3. Pressing the submit button itself in a Filled story still
   submits (same loading-state switch), and the "Create an
   account" / "Forgot password?" / "Back to sign in" /
   "Already have an account? Sign in" links do not submit —
   clicking one does not switch the page to its loading state.
4. Native (separate QA step — not covered by the deployed web
   Storybook above): in the on-device Storybook
   (`npm run storybook:react-native`), the return key submits
   from every field of each page, and the last field's return
   key is labeled "go".

**Run when:** `src/pages/SignInPage.tsx`,
`src/pages/SignUpPage.tsx`, `src/pages/ForgotPasswordPage.tsx`,
`src/pages/ResetPasswordPage.tsx`, the form components they
compose (`src/views/SignInForm.tsx`,
`src/views/SignUpForm.tsx`,
`src/views/ForgotPasswordForm.tsx`,
`src/views/ResetPasswordForm.tsx`), their stories, or a
changeset naming the auth pages or Enter-to-submit.
