---
"@spudly/ui": patch
---

SearchField no longer submits when Enter confirms an IME composition (CJK input): a composition-confirming Enter is held while composing and for a short grace window after the composition ends, mirroring TextField's guard. Ordinary Enter submission is unchanged. This affects every search surface built on SearchField, including the AppShellPage header search and the Recipes/Discover search. Test: in a web Storybook or consuming app, type into a SearchField with an IME (or a composition-event simulator), press Enter to confirm a candidate, and confirm the search does not submit; press Enter again with no composition active and confirm it submits as before.
