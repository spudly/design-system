---
"@spudly/ui": patch
---

AiSessionPage content no longer overlaps the footer: on web SessionShell's frame is now a growing column in the page shell's whole-page flow (its old flex frame collapsed and let content paint over the footer), so session content ends above the footer in every state.
