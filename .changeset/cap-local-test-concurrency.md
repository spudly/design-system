---
"@spudly/ui": patch
---

Internal tooling only: local test runs now cap the test runner's concurrency at 2 — both the pre-commit affected-tests run and `npm test` outside CI. CI keeps the runner's default parallelism. No component, page, or API changes; nothing user-visible to test.
