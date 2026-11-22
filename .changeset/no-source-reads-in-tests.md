---
"@spudly/ui": patch
---

Tooling: new repo-local ESLint rule `design-system/no-source-reads-in-tests` (#772), enabled at warn for test files — tests must not read JS/TS source files, since source-string pins protect spelling rather than behavior. Reads of built `dist` output, declaration files, and data files (JSON/Markdown/CSS/HTML) remain allowed. Promotion to error follows the #733 source-scan conversion tranches.
