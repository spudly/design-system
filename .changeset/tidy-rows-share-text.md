---
"@spudly/ui": patch
---

CardRow and TextActionCardRow render their title/subtitle block through one shared internal component. Rendering is unchanged: the title stays semibold medium text, the optional subtitle stays a hint line beneath it, and the native link form still marks the visible texts decorative while its overlay carries the composed label.
