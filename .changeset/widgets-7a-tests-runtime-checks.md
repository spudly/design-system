---
"@spudly/ui": patch
---

Widget contract tests for ButtonRow, CenteredText, and MainLandmark now verify the components at runtime — calling them directly and asserting the elements, sizing, keys, and roles that actually render — instead of reading widget source files; assertions that only restated TypeScript types were removed. No component behavior changes.
