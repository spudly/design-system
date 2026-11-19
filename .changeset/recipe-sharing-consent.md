---
"@spudly/ui": major
---

RecipeSharingView (and RecipeDetailPage's `sharing` data): removed the `consentDescription` render slot. Pass the publishing-consent description as copy data through `sharing.consentDescription` instead — a plain string, or an ordered run of text/link spans when the copy carries a link such as the Privacy Policy — and the view renders it as the consent checkbox's description itself, with the same loading skeleton while the section loads.
