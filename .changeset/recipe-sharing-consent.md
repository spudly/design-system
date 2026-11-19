---
"@spudly/ui": major
---

RecipeSharingView (and RecipeDetailPage's `sharing` data): removed the `consentDescription` render slot. Pass the publishing-consent description as a plain string through `sharing.consentDescription` instead — the view renders it as the consent checkbox's description itself, with the same loading skeleton while the section loads.
