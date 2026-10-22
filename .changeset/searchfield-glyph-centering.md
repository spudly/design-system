---
"@spudly/ui": patch
---

Fix SearchField's search icon riding above center on Android (spudly/design-system#45): the icon is no longer the "⌕" text glyph at any size — the character's ink is asymmetric inside its em box (36px rode high, and a 24px reduction still rode high on an on-device check), so the icon is now drawn from two fixed-dimension shapes (a bordered circle and a rotated bar) inside the existing 44px glyph box, and centers by construction on web and native. No explicit lineHeight is involved (that remains the banned spudly/eciperay#162 explosion mechanism). Field height is unchanged.
