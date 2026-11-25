---
"@spudly/ui": minor
---

Standardize page chrome (#857): BigFooterShell now uses a sticky-footer model — the content region grows so slack lives inside the content area instead of an empty band above the footer, with a token-level clearance gap so form submit buttons never touch the footer — and standalone pages can supply `header` data to render the full AppTopBar (brand + nav + actions) from the shell. The footer background is now the `footerBackground` semantic token, matching each theme's button (primary) color from the design brief.
