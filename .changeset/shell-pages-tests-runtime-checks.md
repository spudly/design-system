---
"@spudly/ui": patch
---

Shell and public page contract tests now verify AppShellPage, BoundedList, HomePage, LandingPage, and TabbedShellPage at runtime — calling the pages directly and asserting the shells, navigation, search, rows, and callbacks that actually render — instead of reading page source files; assertions that only restated TypeScript types, imports, or story exports were removed. No component or page behavior changes.
