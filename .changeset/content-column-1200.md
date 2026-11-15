---
"@spudly/ui": minor
---

Desktop pages now render their content in a centered column at most 1200px wide — on a wide monitor, page content no longer stretches edge to edge. In the shells that render the app top bar (AppShellPage, TabbedShellPage), the bar's brand, nav, search, and actions align to that same column. The big footer remains full-width, exactly as before. Testable: open any page story at a desktop width over 1200px — the content stops at 1200px and centers, while the footer band runs the full width of the window; open an AppShellPage or TabbedShellPage story at the same width and the top bar aligns with the content column; shrink below 1200px and the content simply fills the width.
