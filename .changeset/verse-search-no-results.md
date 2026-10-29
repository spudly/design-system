---
"@spudly/ui": patch
---

VerseSearchPage now gives feedback when a search matches nothing: when the app reports a completed search through the new optional `hasSearched` prop and the result set is empty (not still searching, no error), the page renders a "No results" empty state — "Try a different word or reference." — consistent with the sibling Memorize pages' empty states (MyVersesPage, MemorizeReviewPage). Before the first search the page still renders no message, exactly as before. On a @spudly/ui bump, re-check in Storybook: Pages/Memorize/VerseSearchPage's NoResults story shows the "No results" empty state, while the DemoMode story (pre-search) shows no message.
