---
"@spudly/ui": minor
---

Password fields in the auth forms gain a show/hide eye toggle: the new PasswordField widget composes the text field with an in-field eye button — while the password is concealed the toggle is named "show password" (or the host's voice wording) and pressing it reveals the typed value in plain text without clearing it; while revealed the toggle is named "hide password" and pressing it masks the value again. SignInForm, SignUpForm, and ResetPasswordForm all render their password fields through PasswordField, and their voice objects gain `showPasswordLabel` / `hidePasswordLabel` slots that hosts must supply. Verify after adopting: each auth form's password field shows the eye toggle, toggling swaps the masked and plain-text rendering with the value intact, and the toggle's accessible name matches the action it will perform in each state.
