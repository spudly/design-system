---
"@spudly/ui": patch
---

Memorize page contract tests now verify the Memorize pages at runtime — calling MemorizationSessionPage, MemorizeReviewPage, MemorizeSettingsPage, MyVersesPage, and VerseSearchPage directly and asserting the shells, headings, copy, actions, and callbacks that actually render — instead of reading page source files; assertions that only restated TypeScript types, story exports, or documentation were removed. No component or page behavior changes.
