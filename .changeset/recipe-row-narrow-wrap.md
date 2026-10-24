---
"@spudly/ui": patch
---

fix(pages): RecipesPage rows no longer collapse on narrow viewports (eciperay #205). At the largest Android display size (~314dp wide) the row's fixed children — the 64dp thumbnail and the Log cook / Delete buttons — consumed the entire row, collapsing the title/subtitle block to ~0dp wide: the text painted nothing yet measured extremely tall, stretching each card past the viewport with only the thumbnail and buttons visible. The row now wraps (flexWrap) and the text block carries an explicit 60dp flexBasis, so when the row runs out of room the buttons wrap onto their own line and the text keeps a readable width. Layout at ordinary widths is unchanged.
