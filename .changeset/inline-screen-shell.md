---
"@spudly/ui": major
---

Remove ScreenShell (#741): its fixed-shell frame is inlined into its only two compositions — RecipeDetailPage (the loading and owner forms render through a page-local frame) and ScrollShell (which renders the frame around its ScrollRegion itself). Both carry the #547 platform split (web grows only, native keeps flex: 1's grow/shrink) and the surface paint, so rendering is unchanged. ScreenShell and ScreenShellProps are no longer exported.
