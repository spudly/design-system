---
"@spudly/ui": patch
---

Fix the Switch story fixture: the Switch WithoutDescription story (Components/Switch) now renders a switch labeled "Dark mode" with no description line, as its name states, instead of incorrectly showing the reminder description. The Off and On stories still show their description. The Switch component itself is unchanged. On a @spudly/ui bump, re-check the Switch stories: WithoutDescription has no description, Off/On keep theirs.
