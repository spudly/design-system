---
"@spudly/ui": patch
---

Eciperay brand asset set (#861): the approved Ecipe-ray mark (PR #887) is now exported under `assets/brand/eciperay/` as a favicon set (SVG, ICO, 16/32/48 PNG), apple-touch and PWA icons, a 1024 app/store icon on the Warm Harvest paper field, and horizontal + stacked wordmark lockups (SVG + PNG) — all generated from the BrandMark component's exact geometry by `tools/brand-assets/generate_eciperay_assets.py` so the assets cannot drift from the rendered mark. This completes the #861 asset sets (the Memorize set shipped in PR #894).
