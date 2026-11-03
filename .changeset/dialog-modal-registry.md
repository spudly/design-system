---
"@spudly/ui": patch
---

Dialog (web): nested dialogs open at the same time — a Dialog composed inside another Dialog, both open in the same commit — now keep keyboard focus in the nested (top) dialog: Tab and Shift+Tab cycle through the nested dialog's controls instead of being swallowed by the parent dialog behind it, which made the nested dialog unreachable by keyboard. The same fix covers a Dialog composed inside a StepOverlay and a StepOverlay opened over an already-open Dialog: whichever layer is presented on top is the one that holds Tab focus, no matter which element currently has focus. On a @spudly/ui bump, re-check in Storybook: Components/Dialog's new NestedDialogs story — both dialogs start open; press Tab repeatedly and confirm focus cycles only between the nested dialog's "Keep draft" and "Discard" buttons, never landing in the parent dialog or on the page behind; then dismiss the nested dialog and confirm the parent dialog stays open.
