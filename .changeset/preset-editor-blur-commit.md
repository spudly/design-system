---
"@spudly/ui": patch
---

Fix PresetValueSelector's custom editor committing its draft when the user moves to a preset instead: while editing a custom value (e.g. a custom scale on RecipeDetailPage or PublicRecipePage), tapping or tabbing to a preset button no longer applies the typed draft first — the edit ends without committing and the preset the user chose is what gets applied. The custom entry still commits when focus leaves the selector entirely and when it is submitted (Enter / return key). On a @spudly/ui bump, re-check in Storybook (Components/PresetValueSelector): type a custom value, then click or tab to a preset and activate it — the preset value applies and the typed draft never flashes through as the selection; type a custom value and click away from the selector entirely — the custom value applies; type a custom value and press Enter — the custom value applies.
