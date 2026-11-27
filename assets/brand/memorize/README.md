# Memorize brand assets (#861)

The full asset set for the approved Memorize mark (open book, golden
rays and flame, bookmark — Quiet Dawn palette, ported in
`src/icons/BrandMark.tsx`, PR #869). Generated from that component's
exact geometry by `tools/brand-assets/generate_memorize_assets.py` —
regenerate, never hand-edit, so the assets cannot drift from the mark
the design system renders.

| File | Use |
| --- | --- |
| `memorize-mark.svg` | The mark on transparency (source artwork) |
| `favicon.svg`, `favicon.ico`, `favicon-16/32/48.png` | Browser favicons |
| `apple-touch-icon-180.png` | iOS home-screen icon |
| `icon-192.png`, `icon-512.png` | PWA icons (transparent) |
| `app-icon.svg`, `app-icon-1024.png` | App / store icon: mark at 76% on the Quiet Dawn paper field (#faf8f2) |
| `lockup-horizontal.svg` / `.png` | Mark + "Memorize" wordmark to the right (Raleway SemiBold, ink #2b2620, transparent) |
| `lockup-stacked.svg` / `.png` | Mark above the wordmark, centred (same type treatment) |
