---
"@spudly/ui": patch
---

Fix SearchField stretching to the full screen height on Android (spudly/eciperay#162), which emptied the Recipes and Shared-with-me screens: the ⌕ glyph's fontSize-valued numeric lineHeight is resolved by Tamagui's style engine as a multiplier of the font size, exploding the field's row on native as it already had on web. The glyph no longer receives a lineHeight and renders inside its own fixed-height box that clips it, so a mis-measured glyph cannot stretch the row (the row keeps its minHeight, so caller-sized inputs can still grow it). CheckboxField — which carried the identical glyph pattern — drops its glyph lineHeight and clips its box the same way.
