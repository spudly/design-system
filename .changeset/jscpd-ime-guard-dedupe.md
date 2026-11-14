---
"@spudly/ui": patch
---

Internal refactor with no behavior change: TextField and SearchField now share one IME composition guard hook instead of carrying identical copies, so a fix to the composition-submit guard lands in both fields at once.
