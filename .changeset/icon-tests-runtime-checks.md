---
"@spudly/ui": patch
---

Icon contract tests now verify the icon registry and icon components at runtime instead of reading component source files, so the same guarantees are checked against the code that actually ships. No component or page behavior changes.
