---
"@spudly/ui": minor
---

Desktop pages now render their content in a centered column at most 1200px wide, and the app top bar's brand, nav, search, and actions align to that same column — on a wide monitor, page content no longer stretches edge to edge. The big footer remains full-width, exactly as before. Testable: open any page story at a desktop width over 1200px — the content and the top bar stop at 1200px and center, while the footer band runs the full width of the window; shrink below 1200px and the content simply fills the width.
