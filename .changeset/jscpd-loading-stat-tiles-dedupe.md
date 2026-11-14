---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: StatBand and StatRow now share a single LoadingStatTiles widget for their loading dummy stats instead of two identical copies, so both bands keep rendering the exact same skeleton tiles as before.
