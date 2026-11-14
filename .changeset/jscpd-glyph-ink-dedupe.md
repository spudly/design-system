---
"@spudly/ui": patch
---

Button's icon slot and DropdownButton's disclosure chevron resolve their glyph ink from one shared internal hook. Rendering is unchanged: each variant's glyph still takes the variant label's ink, a ghost button's glyph still takes the variant's own ink, and a danger-tone button's glyph still takes the danger ink.
