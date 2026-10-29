---
"@spudly/ui": patch
---

Public pages de-styled (#119): PublicPageFrame, DiscoverPage, LegalDocumentPage, and LandingPage now compose shared components and pass data and callbacks only — their rendering is unchanged. The frame renders through the new PublicFrameLayout, PublicFrameHeader, PublicFrameFooter, and BrandLink components; the legal document renders through DocumentHeader, DocumentFooter, and the new ProseDocument structured-prose renderer (the page's Legal\* content types now alias its Prose\* model); the landing renders through the new Hero, CtaLink, CtaRow, FeatureCard, and CardGrid components; and DiscoverPage's catalog renders through the shared BoundedList with the new CatalogHeader and CatalogFiltersBar components and the shared ListLoadingState, ListErrorState, and ListLoadingFooter list states — the states now carry their header offset as padding instead of a margin, the treatment RecipesPage's catalog already used for the same slot.
