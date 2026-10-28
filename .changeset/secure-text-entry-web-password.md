---
"@spudly/ui": patch
---

Fix password fields showing in plain text on web: `TextField` now translates the React Native `secureTextEntry` prop per platform — on web a secure field renders as a masked password input (`type="password"`, a caller-supplied `type` still wins), and on native `secureTextEntry` passes through unchanged. This affects every password field built on TextField: the SignInPage, SignUpPage, and ResetPasswordPage password fields and the MemorizeSettingsPage password field no longer display the entered password as readable text on web. On a @spudly/ui bump, re-check on web: type into the Password field on the Sign in and Sign up pages (Storybook Pages/SignInPage, Pages/SignUpPage) and confirm the entry is masked, and confirm a plain field such as Email still renders as a normal text input.
