---
"@spudly/ui": patch
---

Badge: the colored-tag form (`color` prop) is inverted to match the tone badges — the tag color's dark shade token is now the background and its light shade token is the label and border, in every theme. Tag colors gain dark/light shade tokens per theme (`tagColorShades` on each theme, registered as `tag<Name>Dark` / `tag<Name>Light`).
