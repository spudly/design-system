---
"@spudly/ui": patch
---

Fix MealsHubPage's plans tab footer overlapping plan cards at narrow widths: PinnedHeaderShell's root frame is now platform-split — on web it grows in normal document flow (flexGrow) instead of holding a bounded flex: 1 frame inside the footer shell, so the BigFooter lands below the last plan card; native keeps the bounded frame that gives the plans scroller its height.
