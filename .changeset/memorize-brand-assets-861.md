---
"@spudly/ui": patch
---

Memorize brand asset set (#861): the approved Memorize mark (PR #869) is now exported under `assets/brand/memorize/` as a favicon set (SVG, ICO, 16/32/48 PNG), apple-touch and PWA icons, a 1024 app/store icon on the Quiet Dawn paper field, and horizontal + stacked wordmark lockups (SVG + PNG) — all generated from the BrandMark component's exact geometry by `tools/brand-assets/generate_memorize_assets.py` so the assets cannot drift from the rendered mark.
