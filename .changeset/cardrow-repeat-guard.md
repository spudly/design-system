---
"@spudly/ui": patch
---

CardRow's press form no longer re-fires its press when Enter or Space is held down: keyboard activation now ignores held-key repeat events, matching a native button, while still preventing the key's default behavior so Space does not scroll the page. On a @spudly/ui bump, re-check in Storybook: Components/CardRow \u2014 focus a press-form row, hold Enter or Space, and confirm the press fires exactly once.
