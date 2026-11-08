---
component: LegalDocumentPage
run_when:
  - "src/pages/LegalDocumentPage.tsx, its stories, or a changeset naming LegalDocumentPage."
---

# LegalDocumentPage — manual test steps

Colocated manual test steps for `src/pages/LegalDocumentPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LegalDocumentPage

Open in `Pages/Eciperay/LegalDocumentPage`: PrivacyPolicy,
TermsOfService, Wide.

1. The document title is the level-1 heading, with the muted
   last-updated line under it — "Last updated: July 22, 2026"
   in PrivacyPolicy, "Last updated: June 18, 2026" in
   TermsOfService (each story's fixture date); each section
   title is a level-2 heading.
2. The paragraph renders its strong span bold and its mailto
   link underlined in link ink; the list renders bulleted rows
   with bold lead-ins; in PrivacyPolicy, the "Search engines"
   paragraph renders its `noindex` span in monospace code
   styling (the TermsOfService fixture has no code span).
3. In Wide (the unconstrained story — the other two pin a
   430px viewport, where the cap cannot bind): on a wide
   viewport the prose column caps at 768px and centers; the
   frame header (wordmark + sign-in links) and footer (the
   host's legal links) render as real links.

**Run when:** `src/pages/LegalDocumentPage.tsx`, its stories,
or a changeset naming LegalDocumentPage.
