---
"@spudly/ui": major
---

Remove the `ChunkErrorBoundary` export (and its `ChunkErrorBoundaryProps` / `ChunkErrorBoundaryState` types) from the package root — the final step of the #438 export-surface program. Hosts no longer import the boundary directly: pages that slot lazy content (TabbedShellPage, AppShellPage) already wrap it in the internal error boundary, so lazy surfaces keep the same failure fallback and reload recovery with no host-side change beyond deleting any direct `ChunkErrorBoundary` import. Eciperay and Memorize have already migrated onto the pages-only surface, so nothing in either app imports the boundary.
