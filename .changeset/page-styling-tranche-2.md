---
"@spudly/ui": patch
---

LandingPage, LegalDocumentPage, MealsHubPage, and ShoppingListPage no longer apply styling directly (#119 tranche 2): LandingPage's hero renders in the new HeroStack, its call-to-action row in the new StackedButtonRow, and its feature cards in the new CardGrid; LegalDocumentPage's header renders in the new BannerRow, its document in the new ProseColumn and ProseStack, and its bullet lists in the new BulletList (prose links now render through TextLink); MealsHubPage's loading meal rows render as the new LoadingActionCardRow and ShoppingListPage's loading rows as the new LoadingListItem. Rendering is unchanged.
