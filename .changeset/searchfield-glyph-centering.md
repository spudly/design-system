---
"@spudly/ui": patch
---

Fix SearchField's ⌕ glyph riding above center on Android (spudly/design-system#45): the glyph drops from 36px to 24px so its natural line box (~36px, no explicit lineHeight — that remains the banned spudly/eciperay#162 explosion mechanism) fits inside the 44px glyph box and the box's centering centers the ink. Field height is unchanged.
