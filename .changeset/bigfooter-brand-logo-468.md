---
"@spudly/ui": patch
---

BigFooter brand: a page's footer data can now supply a logo for the brand block (`brand.logo`). When a logo is supplied, the footer renders it inside the brand link — in a design-system-owned box 40px tall — instead of the app-name wordmark; the link still points home and keeps the app name as its accessible name. When no logo is supplied, the footer renders the app-name wordmark exactly as before, so current pages are unchanged until their host supplies a logo. Test: open the BigFooter WithLogo story and confirm the brand shows the logo lockup rather than the plain wordmark text; open the BigFooter Default story and confirm the wordmark still renders as text.
