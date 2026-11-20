---
"@spudly/ui": patch
---

PinnedHeaderShell story: the Default story now demonstrates the pinning it documents (#723). The content decisively overflows the story's bound 480px frame and scrolls in a story-local bounded scroller composed as the shell's children — standing in for the self-scrolling page a real consumer composes (on web, ScrollRegion deliberately renders no scroller under the page-scroll model, so it could not show the behavior in a bound frame) — while the Meals header and tabs stay pinned above it. No component changes.
