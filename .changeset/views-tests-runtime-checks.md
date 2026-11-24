---
"@spudly/ui": patch
---

View contract tests now verify the account, auth, recipe-editor, catalog, and form views at runtime — rendering them with the fixture voice and asserting the copy, actions, and accessible names that actually render — instead of reading view source files; assertions that only restated TypeScript types or styled-component geometry were removed. No component or page behavior changes.
