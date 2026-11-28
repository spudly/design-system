---
"@spudly/ui": patch
---

Internal lint cleanup with no component behavior change: source files were reordered to the enforced import order and useless `undefined` values removed by the auto-fixer as part of restoring TypeScript linting. All components render and behave exactly as before.
