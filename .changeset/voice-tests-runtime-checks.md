---
"@spudly/ui": patch
---

Voice core contract tests now verify the voice provider and hook at runtime against the built output — exported from the package root, failing fast with no provider, and supplying exactly the given voice object — instead of reading source files; assertions that only restated TypeScript types were removed. No component or page behavior changes.
