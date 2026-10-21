---
"@spudly/ui": patch
---

Fix SearchField stretching to the full screen height on Android (spudly/eciperay#162), which emptied the Recipes and Shared-with-me screens: the ⌕ glyph's fontSize-valued numeric lineHeight is resolved by Tamagui's style engine as a multiplier of the font size, exploding the field's row on native as it already had on web. The glyph no longer receives a lineHeight, the SearchField row is capped at a fixed 44px height with hidden overflow, and CheckboxField — which carried the identical glyph pattern — drops its glyph lineHeight and clips its box the same way.
