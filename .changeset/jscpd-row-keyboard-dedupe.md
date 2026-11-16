---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: CardRow, CheckRow, and MarkableRow now build their web keyboard-activation handler (Enter/Space, held-key repeats ignored) through one internal keyboardActivationHandler helper instead of three identical copies, so the rows keep activating exactly as before and cannot drift apart.
