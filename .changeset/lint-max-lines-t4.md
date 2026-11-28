---
"@spudly/ui": patch
---

Internal lint cleanup with no component behavior change: targeted `max-lines` suppressions were added at the top of cohesive story, test, and fixture files so the restored TypeScript linting's file-length debt can be burned down in batches. All components render and behave exactly as before.
