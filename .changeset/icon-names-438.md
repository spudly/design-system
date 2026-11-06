---
"@spudly/ui": minor
---

Icons by name as data (#438 Part 4): the design system's icon slots now take an icon NAME from the DS semantic name set — `add`, `feedback`, `home`, `meals`, `print`, `profile`, `recipes`, `share`, `shared`, `tags`, `warning` — instead of an icon component, and the slot owner resolves the name to the glyph internally. Button's icon slot and DropdownButton's trigger icon take names; RecipeDetailPage's Print and Share actions name the "print" and "share" glyphs and render the same Feather printer / share-2 icons as before, at the same sizes and colors. Icon components remain internal building blocks: no icon is exported from the package root, and the package's public surface is unchanged.
