---
"@spudly/ui": major
---

The remaining titled and banner view literals move to the app-supplied voice object, as tranche 2e of the voice-as-theme system (#539): ChangedListBanner's Revert action; ConsentBannerView's Accept / Decline action labels; InstallBannerView's Dismiss install banner accessible name; and RecipeExportPickerView's Search recipes… placeholder, No recipes to export yet. empty message, and Exporting… pending label. Apps must supply the new changedListBanner, consentBannerView, installBannerView, and recipeExportPickerView voice slots through VoiceProvider; Storybook's fixture voice carries the same strings these views previously hard-coded, so rendered output is unchanged. ConfirmActionView, LegalSection, CatalogHeader, and AppTopBar carry no hard-coded copy — their titles and labels are caller-supplied data — and are unchanged.
