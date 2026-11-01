---
"@spudly/ui": patch
---

MealPlanFormPage: the Starts on and Ends on fields are now date fields on web — they render as real date inputs (`type="date"`) carrying the same YYYY-MM-DD values, so a date can be picked/typed in the browser's date control instead of being entered as free text; on native they keep text entry with a digits-and-hyphen keyboard. TextField: placeholders now render in the theme's muted text color by default, so field placeholders (including the meal plan date fields' YYYY-MM-DD hint) are visible on Android/native instead of blending into the field background; a placeholder color a caller passes still wins. Test: open MealPlanFormPage, confirm Starts on and Ends on present as date fields on web and accept a date that round-trips as YYYY-MM-DD, and confirm TextField placeholders are legible on Android/native.
