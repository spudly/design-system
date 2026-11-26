---
"@spudly/ui": minor
---

AppShellPage, TabbedShellPage, and LandingPage now render the analytics consent banner and the mobile-app install banner themselves (#879): a host passes each banner as data — `consentBanner` (message around a real privacy-policy link, plus accept/decline callbacks) and `installBanner` (message, app-store links, and a dismiss callback) — and the page renders the banner pinned to its screen edge (install at the top, consent at the bottom) with the accept/decline labels defaulting to the voice copy. Passing no banner data renders no banner, exactly as before, so hosts can delete their locally built banner UI and keep only the consent/install state wiring. Verify after adopting: with consent outstanding, the consent banner shows on shell pages and on the signed-out landing page and Accept/Decline record the choice; with the install prompt undismissed, the install banner shows with working store links and its dismiss button hides it.
