---
"@spudly/ui": major
---

PublicPageFrame is removed. Hosts no longer wrap public pages in the frame — the DS public pages render their own footer through the shared BigFooter pattern from their `footer` prop, so a host renders the page directly (for example, PublicRecipePage with its `footer` data) and gets the same wide public surface with the page's BigFooter at the bottom. LegalDocumentPage keeps its brand wordmark and Sign in header links and its footer in place, rendered by the page itself. Test: open the PublicRecipePage Default story and confirm the recipe sections and the BigFooter (brand, link columns) render with no frame wrapper, and open the LegalDocumentPage PrivacyPolicy story and confirm the wordmark and Sign in links sit above the document and the footer below it.
