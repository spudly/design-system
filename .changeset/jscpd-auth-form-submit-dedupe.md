---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: the four auth forms (ForgotPasswordForm, ResetPasswordForm, SignInForm, SignUpForm) now share a single AuthFormSubmit view for their form-level error alert and primary submit button instead of four identical copies, so all four forms keep rendering the exact same error line and submit button as before.
