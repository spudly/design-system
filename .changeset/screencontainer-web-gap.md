---
"@spudly/ui": patch
---

Fix `ScreenContainer` pages stacking flush on web: the shell's 16px section gap now separates a page's sections on web, matching native — previously web rendered the sections directly against each other (0px at every joint), so e.g. MealPlansPage's loading spinner sat flush against the "New meal plan" button instead of 16px below it. On a @spudly/ui bump, re-check in Storybook: Pages/Eciperay/MealPlansPage's Loading story shows the spinner centered 16px below the create button and its Default story shows the heading, button, and plan cards at the same even 16px rhythm; Components/ScreenContainer's Scrollable story shows the heading and each card separated by 16px; and the auth pages (SignInPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage) show their fields and actions at the same 16px rhythm in the centered auth column.
