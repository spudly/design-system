---
"@spudly/ui": patch
---

Refine the SearchField fix from spudly/eciperay#162: the ⌕ glyph now renders inside its own fixed-height clipping box (StyledGlyphBox) instead of the field's row being capped at a fixed height, so a mis-measured glyph still cannot stretch the row, while the row keeps its minHeight and a caller-sized input (props forward via ...rest) can still grow it.
