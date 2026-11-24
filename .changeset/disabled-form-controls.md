---
"@spudly/ui": minor
---

Form controls: SelectField, RadioOptionGroup, Switch, ColorPickerField, PresetValueSelector, and NumberStepper now accept a `disabled` prop (#801), following the established Slider/StarRatingInput treatment — the control (or whole group, for group controls) renders at reduced opacity, interaction and focus are removed as appropriate, handlers never fire, and the disabled state is announced via accessibilityState / aria-disabled. Each control gains a Disabled story, and the FormComposite Disabled variant now disables every control in the form.
