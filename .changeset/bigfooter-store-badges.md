---
"@spudly/ui": patch
---

BigFooter: app-store links now show the official store badges instead of plain text buttons. Each footer store link names its store (`store: "app-store"` or `store: "google-play"` — a required new field on the footer data hosts supply), and the footer renders Apple's "Download on the App Store" badge for App Store links and Google's "Get it on Google Play" badge for Google Play links, each as a real link whose accessible name is the link's label. Testable terms: open the BigFooter stories (or any page story with a footer) — the Eciperay and Memorize footers show the black App Store badge with the Apple logo and the black Google Play badge with the multicolor Play triangle instead of labeled buttons; each badge links to the same store URL as before, a screen reader announces it by its label ("Download on the App Store" / "Get it on Google Play"), and a footer whose storeLinks array is empty still shows no store section.
