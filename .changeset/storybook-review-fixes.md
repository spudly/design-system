---
"@spudly/ui": patch
---

Fix the 13 issues from Stephen's Storybook review (#23): Storybook theme switching now works via a combined `storybookTamaguiConfig` (all brands as sub-themes of one config); Avatar renders its image (`src` instead of the web-ignored `source`); BlankWord flows inline and left-aligns in both states; the Button ghost variant is visible (subtle fill, border, readable label) and variant label colors actually reach the button text; the vertical Divider stretches to its container; the RadioOptionGroup indicator is centered; the Spinner paints (its color no longer resolves to `stroke: none`); the Switch has explicit dimensions; SearchField's icon is doubled; ToastProvider composes Viewport/List inside the Toast root; and the ScreenContainer and StepDots stories are corrected.
