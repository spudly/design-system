---
"@spudly/ui": patch
---

Internal lint cleanup with no component behavior change: empty arrow-function handlers were given explicit `/* noop */` comment bodies so the restored TypeScript linting passes with zero `@typescript-eslint/no-empty-function` errors. All components render and behave exactly as before.
