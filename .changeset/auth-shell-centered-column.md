---
"@spudly/ui": patch
---

Fix the auth pages stretching full width on wide screens: the `ScreenContainer` `auth` shell (used by SignInPage, SignUpPage, ForgotPasswordPage, and ResetPasswordPage) now caps its content column at 480px and centers it, matching the FormScreenLayout geometry the web auth screens had before — on a desktop-width browser the Email field and Sign In button sit in a centered narrow column instead of stretching edge-to-edge. Phone-width rendering is unchanged (the cap does not bind). On a @spudly/ui bump, re-check on web at a desktop viewport: open the Sign in and Sign up pages (Storybook Pages/SignInPage, Pages/SignUpPage) and confirm the form renders as a centered column about 480px wide, and confirm at a phone-width viewport that the layout is as before.
