---
"@spudly/ui": minor
---

PrevNextNav: new `backDisabled` prop, symmetric with the existing `nextDisabled` — the Back button stays visible in its disabled state (e.g. on the first step of a wizard or cooking-mode flow) without changing the row layout. Omitting `onBack` still hides the Back button entirely. This closes the gap that kept the eciperay app-side PrevNextNav adapter alive (#158).
