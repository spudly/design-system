---
"@spudly/ui": patch
---

Button (secondary variant): secondary buttons now render with a 1px border in the same color as their text (#459). Testable terms: render any secondary Button (the Button stories, a secondary action inside an info Alert) — the button shows a thin border matching its label color, so it stays legible on tinted surfaces; primary, danger, and ghost buttons are unchanged and remain borderless.
