---
"@spudly/ui": patch
---

Dialog (web): a modal dialog with no focusable content — for example an informational dialog with text and no action buttons — now keeps keyboard focus inside the dialog while it is open, instead of letting Tab or Shift+Tab escape to controls behind the overlay. On a @spudly/ui bump, re-check in Storybook: Components/Dialog's WithoutActions story — open it, press Tab and Shift+Tab repeatedly, and confirm focus never lands on the "About" button behind the overlay.
