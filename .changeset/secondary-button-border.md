---
"@spudly/ui": patch
---

Button (secondary variant): secondary buttons now render with a 1px border in the same color as their text (#459) — including the selected state, where the border follows the label color onto the primary fill. Testable terms: render any secondary Button (the Button stories, a secondary action inside an info Alert) — the button shows a thin border matching its label color, so it stays legible on tinted surfaces. Primary, danger, and ghost buttons look unchanged: the filled variants carry an invisible 1px border so every variant shares the same geometry (a secondary button is the same size as a primary one with the same label).
