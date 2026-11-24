---
"@spudly/ui": patch
---

Voice surface tests for the auth, standalone, and utility pages, the recipe panels, the remaining widget fallbacks, and the no-hard-coded-copy guardrail now verify copy at runtime against the built output — pages and widgets are rendered under a supplied voice and asserted to carry that voice's strings — instead of reading source files; assertions that only restated TypeScript types or a deleted source scanner's internals were removed. No component or page behavior changes.
