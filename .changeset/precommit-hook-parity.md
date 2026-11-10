---
"@spudly/ui": patch
---

Internal tooling only: the pre-commit hook now also runs eslint --fix (cached) on staged code files, an incremental typecheck, and the colocated unit tests of staged sources. No component, page, or API changes; nothing user-visible to test.
