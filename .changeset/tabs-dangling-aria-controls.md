---
"@spudly/ui": patch
---

Tabs (button variant): a tab no longer carries an `aria-controls` attribute naming a tab panel that is never rendered (#454). The Tabs widget renders triggers only — each page shows its own panel content for the selected tab — so the primitive's generated panel reference dangled for every consumer (RecipeDetailPage and the other tabbed pages, TabbedShellPage). Testable terms: render any button-variant Tabs surface (the Tabs stories, a tabbed page story) and inspect the tabs — no tab carries `aria-controls`, tabs still render with their tab semantics, and the selected tab is still marked selected. The link (navigating) variant is unchanged: its anchors never carried the attribute.
