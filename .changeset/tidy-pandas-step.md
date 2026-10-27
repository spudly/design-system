---
"@spudly/ui": patch
---

NumberStepper: the editable value field no longer renders as a browser number input, so web browsers no longer show their own native spin buttons next to the stepper's −/+ buttons. Direct entry still works the same way (numeric keyboard, commits on blur/submit, snapped and clamped). Affects the NumberStepper component and pages that use its editable mode, including the RecipeDetailPage servings control.
