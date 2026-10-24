---
"@spudly/ui": patch
---

fix(components): BlankWord's hidden-mode underline now sits at the bottom of the line on native — the anchor is platform-conditional (web 4, native -1) because Yoga's tighter glyph box left the line floating at mid x-height on Android (#93).
