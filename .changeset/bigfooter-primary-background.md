---
"@spudly/ui": patch
---

BigFooter now renders as a solid primary band: the footer background is the primary color and the brand wordmark, social icon links, column titles, and column links all render in on-primary ink so they stay legible on that fill; the old top divider line is gone. App-store links stay as light secondary buttons, visible as pills on the band. Testable terms: in any page story with a footer (or the BigFooter stories), the footer band is primary-colored end to end, every footer text and icon reads clearly against it, and no light divider stripe separates the footer from the page content above it.
