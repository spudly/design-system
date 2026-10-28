---
"@spudly/ui": minor
---

VerseSearchPage (Memorize): search results the app marks with the new optional `added` flag on `VerseSearchPageItem` now render a disabled secondary "Added" button instead of the active "Add to memorize list" button, so users get clear confirmation that a verse is already in their memorize list and don't re-add it. Results without the flag are unchanged. On a @spudly/ui bump, re-check in Storybook: Pages/Memorize/VerseSearchPage's WithAddedResult story shows the first result as "Added" (disabled) and the remaining results with the active Add button.
