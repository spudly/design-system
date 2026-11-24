---
"@spudly/ui": major
---

New layout primitives (#746, tranche 1): `Row`, `Col`, and `Spacer`. Row renders an XStack and Col a YStack, each taking only Stephen's strict subset of semantic props — axis-aware position props (`left`/`center`/`right`, `top`/`middle`/`bottom`), distribution props (`between`/`around`/`evenly`), `stretch`/`baseline`, `grow`/`shrink`/`wrap`, and a t-shirt `gap` — with no margin, padding, width, or general style props. Spacer takes t-shirt `x`/`y` sizes for the rare case parent `gap` cannot express. Later tranches convert all XStack/YStack usage onto Row/Col and eliminate the style-only stack wrappers.
