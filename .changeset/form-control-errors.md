---
"@spudly/ui": minor
---

Uniform form-control error treatment (#804): every form control in `src/widgets/form/` now renders its error through one shared treatment — the design system's Alert at error severity (the announcement pattern ColorPickerField already used) — via a shared internal FieldError, keeping each control's `aria-invalid` / `aria-describedby` wiring at `${id}-error` and its error border where it has one. TextField (and PasswordField through it), TextAreaField, SelectField, RadioOptionGroup, Slider, CheckboxField, ColorPickerField, and LabeledField migrate their inline error text to the Alert; SearchField, CheckboxSelectList, Switch, StarRatingInput, PresetValueSelector, NumberStepper, and AutocompletePicker gain an `error` prop (AutocompletePicker's is distinct from its `searchError`). Each affected control gains a WithError story, and the FormComposite WithErrors story now renders every control in its error form.
