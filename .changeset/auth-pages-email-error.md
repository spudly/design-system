---
"@spudly/ui": patch
---

Auth pages: SignInPage, SignUpPage, and ForgotPasswordPage now accept an `emailError` prop for a field-level email validation error. When a host passes `emailError`, the message renders under the email field with the field's error styling (red border, `aria-invalid`, `aria-describedby`) — separate from the form-level `error` alert above the submit button, which is unchanged. Hosts can set either error, both, or neither. This lets hosts (e.g. eciperay's sign-in validation) attach a validation error to the email field itself instead of only showing a form-level alert. Each auth page gains a `WithEmailError` story showing the field-level rendering on a filled, otherwise-valid form.
