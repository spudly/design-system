---
"@spudly/ui": patch
---

Dialog (web): closing the dialog now returns keyboard focus to the element that held focus when it opened — for example the button that opened a confirmation or error dialog — instead of leaving focus nowhere after dismissal. The restore happens for every close path (action button, Escape, overlay dismissal) and only while the original element is still on the page. On a @spudly/ui bump, re-check in Storybook: Components/Dialog's Interactive story — focus the "Delete recipe" button, open the dialog, dismiss it with Cancel, and confirm keyboard focus is back on "Delete recipe".
