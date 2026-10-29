---
"@spudly/ui": patch
---

VerseSearchPage's search placeholder is now mode-aware: in demo mode (`usingDemo`) the field reads `e.g. Ether 12:27 or "weakness"` instead of suggesting "charity", which the built-in demo set contains no verse for — following the old suggestion landed on an empty results list. "Weakness" is answered by the demo set with Ether 12:27, the reference example both modes share. Full-library mode keeps `e.g. Ether 12:27 or "charity"` unchanged. On a @spudly/ui bump, re-check Pages/Memorize/VerseSearchPage in Storybook: the DemoMode story's search field shows the "weakness" placeholder, and the Default story (full library) still shows "charity".
