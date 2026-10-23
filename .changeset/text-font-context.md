---
"@spudly/ui": patch
---

Fix inconsistent font-family on rendered pages (#69): Text, VerseText, Button, and SelectField's value/item text now pass their font family as an instance prop carrying the bare registered font name (`body` / `verse`), which is what makes Tamagui emit the font-context class on web. Previously the family existed only as a styled() value or in the `$body` / `$verse` form, which resolves to an undefined `var(--f-family)`, so body text, button labels, and select values silently inherited the surrounding page's default family while fonted primitives (Input, Label) rendered in the theme stack.
