---
"@spudly/ui": patch
---

feat(tokens): Raleway is now the font for all themes (#65) — the base `sans` token stack leads with Raleway and the native/Android names are "Raleway", replacing Warm Harvest's Georgia UI stack and Quiet Dawn's Avenir Next stack (both themes now inherit the base font tokens). Headings and body both resolve through this role. The `serif` verse/reading role is unchanged (Memorize verse text is the deliberate exception, #66). Apps must register a font named "Raleway" (variable font recommended) to render it natively; web consumers load Raleway from Google Fonts, as the DS Storybook now does.
