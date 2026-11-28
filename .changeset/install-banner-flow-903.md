---
"@spudly/ui": patch
---

The install banner on AppShellPage, TabbedShellPage, and LandingPage now renders in flow at the top of the page, above the AppTopBar, tab bar, and hero, instead of covering them (#903). ActionBar, FixedActionBanner, and InstallBannerView gain an optional `pinning="flow"` mode that renders the bar in normal document flow; the default viewport pinning for standalone use is unchanged, and the banner still dismisses through the host's `onDismiss`. Verify after adopting: opening AppShellPage, TabbedShellPage, or LandingPage with an install banner shows the banner above the page header/hero with the header, headings, tab bar, and hero fully visible, and a standalone InstallBannerView still pins to the viewport top.
