---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: the LegalDocumentPage and prose-document contract tests now share one SSR runtime loader and render helper (test/legalDocumentSsr.tsx) instead of carrying identical copies, so both test suites keep rendering the exact same built page as before.
