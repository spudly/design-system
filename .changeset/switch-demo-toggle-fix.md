---
"@spudly/ui": patch
---

Fix the Switch story fixture: the Switch stories (Components/Switch — Off, On, and WithoutDescription) now actually toggle when clicked or pressed, instead of staying pinned to the story's initial checked state. The SwitchDemo wrapper spreads the story props first and lets its stateful checked/onCheckedChange win, seeding the initial state from the story's checked prop. The Switch component itself is unchanged. On a @spudly/ui bump, re-check the Switch stories: clicking a switch in any of the three stories flips it on/off.
