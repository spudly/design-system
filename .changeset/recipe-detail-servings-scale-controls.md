---
"@spudly/ui": patch
---

RecipeDetailPage ingredients: servings/scale controls reworked for usability (#73). Servings is now an inline stepper (label beside the stepper, current value in a fixed-width box so digit changes never shift the buttons) via a new additive NumberStepper `layout="inline"` prop, and Scale is a single non-wrapping row of equal-width chips via a new additive ToggleChipGroup `wrap={false}` prop — neither control can change height or push the ingredient list around when values change, and every change is one tap. No contract change: the same servings/scale values and change handlers, so app wiring is untouched.
