---
"@spudly/ui": patch
---

Auth pages submit on Enter/return: on SignInPage, SignUpPage, ForgotPasswordPage, and ResetPasswordPage, pressing Enter (web) or the return key (native) in any field now triggers the page's submit action, matching the native-form behavior the retired web views had. While the page is loading, Enter does nothing, exactly as the disabled submit button does; pressing the submit button itself is unchanged, and the final field of each page shows the "go" return key. On a @spudly/ui bump, re-check the four auth pages (Pages/SignInPage, Pages/SignUpPage, Pages/ForgotPasswordPage, Pages/ResetPasswordPage in Storybook): typing in a field and pressing Enter submits, and Enter while the page shows its loading label does not submit again.
