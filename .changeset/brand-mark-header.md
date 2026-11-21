---
"@spudly/ui": minor
---

Header brand: the brand identity a host passes to AppShellPage / AppTopBar (and to BigFooter's brand block) may now name the brand's graphic mark as data (`mark: "eciperay"`). When named, the design system renders its own DS-owned brand mark — the Eciperay logo geometry, ported into the DS — before the wordmark: in the header as part of the BrandLink (a real link home whose accessible name stays the brand label), and beside BigFooter's brand wordmark. A brand that names no mark (Memorize) renders its wordmark exactly as before, with no placeholder. Brand identity remains data only — hosts never supply a logo element. Verify after adopting: the signed-in and signed-out headers show the Eciperay mark beside the wordmark, and a Memorize header shows the wordmark alone.
