---
"@spudly/ui": major
---

The auth form view literals move to the app-supplied voice object, as tranche 2c of the voice-as-theme system (#539): SignInForm's Email / Password labels, Sign In / Signing in… submit labels, and Create an account / Forgot password? footer links; SignUpForm's Your name / Email / Password labels, Create Account / Creating account… submit labels, and Already have an account? Sign in link; ForgotPasswordForm's Email label, Send Reset Link / Sending… submit labels, and Back to sign in link; and ResetPasswordForm's New password label and Update password / Updating… submit labels. Apps must supply the new signInForm, signUpForm, forgotPasswordForm, and resetPasswordForm voice slots through VoiceProvider; Storybook's fixture voice carries the same strings these forms previously hard-coded, so rendered output is unchanged.
