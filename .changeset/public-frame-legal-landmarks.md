---
"@spudly/ui": patch
---

PublicFrameLayout / PublicPageFrame and LegalDocumentPage: the public frame and legal page now carry web landmarks again — the header band (PublicFrameHeader, and LegalDocumentPage's DocumentHeader) renders as the banner landmark, the content/document column renders as the main landmark, and the footer band (PublicFrameFooter, and LegalDocumentPage's DocumentFooter) renders as the contentinfo landmark. On web, verify in Storybook (Components/PublicFrameLayout, Pages/Eciperay/PublicPageFrame, Pages/Eciperay/LegalDocumentPage) that a screen reader's landmark navigation finds exactly one banner, one main, and one contentinfo per page, with the page/document content inside main. Native rendering is unchanged.
