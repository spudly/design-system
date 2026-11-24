---
"@spudly/ui": patch
---

StatusMessage is now classified as a View rather than a Widget: it lives with the other shared page fragments and is exported from the views barrel instead of the widgets barrel. No behavior, props, or visual changes — its always-mounted polite live region (#318) and $textMuted ink are preserved exactly, and the recipe and shell pages keep rendering the same transient confirmation line.
