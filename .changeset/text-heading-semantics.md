---
"@spudly/ui": patch
---

Text heading semantics on web: `Text` with the `heading` variant now renders with heading semantics on web (`role="heading"`, `aria-level="1"`), and the `subheading` variant renders at `aria-level="2"` — previously both rendered as plain styled text with no heading semantics, so screen-reader users could not navigate design-system pages by heading on web. Native rendering gains the equivalent `header` accessibility role with visuals unchanged, and a caller-supplied role still wins over the default. Every page title built on these variants is covered, including the auth pages (SignInPage "Welcome back", SignUpPage "Create account", ForgotPasswordPage, ResetPasswordPage). On a @spudly/ui bump, re-check in Storybook: a page story's title (e.g. Pages/SignInPage) is exposed as a level-1 heading in the accessibility panel / rendered DOM with no `accessibilityrole` attribute, and section titles render as level-2 headings.
