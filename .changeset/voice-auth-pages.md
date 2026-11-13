---
"@spudly/ui": major
---

The auth page literals move to the app-supplied voice object, as tranche 3a of the voice-as-theme system (#539): SignInPage's Welcome back heading; SignUpPage's Create account heading; ForgotPasswordPage's Reset password heading and We'll send a reset link to your email. intro line; and ResetPasswordPage's New password heading and Choose a new password for your account. intro line. Apps must supply the new signInPage, signUpPage, forgotPasswordPage, and resetPasswordPage voice slots through VoiceProvider; Storybook's fixture voice carries the same strings these pages previously hard-coded, so rendered output is unchanged.
