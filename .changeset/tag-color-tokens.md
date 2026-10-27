---
"@spudly/ui": minor
---

Tag colors are now named design-system tokens instead of raw hex values. TagPill, ColorPickerField, TagsPage, and RecipeDetailPage work with tag color names (indigo, red, orange, amber, lime, green, teal, cyan, blue, purple, pink, gray) and resolve each name through the active theme: Warm Harvest renders the familiar palette shades and Quiet Dawn renders its own cooler shades of the same names. TagsPage's `colorOptions` and ColorPickerField's `colors` now take token names, ColorPickerField reports the selected name, and its swatch labels name the color ("Select color blue"). A tag stored with a legacy palette hex still renders — the hex resolves through its token name (new exported helpers `tagColorNameForHex` and `resolveTagColorValue`, plus the `tagColorNames` list) — and the legacy hexes are unchanged as the Warm Harvest values, so existing tags look the same in Eciperay.
