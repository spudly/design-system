---
"@spudly/ui": patch
---

The leaf form controls — TextField, SearchField, CheckboxField, NumberStepper, RadioOptionGroup, and TextAreaField, plus their shared FieldShell — move from src/views to src/widgets (#698 tranche 2, Option B): they own their styling, so under the no-direct-styling rule extended to views they are widgets, not views. Names, props, and rendering are unchanged; the components were never part of the published package surface (pages-only exports stand), and pages and views now reach them through the widgets layer. The shared field hooks (useFieldA11y, useImeCompositionGuard) stay in src/views, which the moved widgets import — the same widgets-to-views direction other widgets already use. Storybook navigation changes with the move: the six controls' stories move from the Views/<Name> group to Widgets/<Name> (Widgets/TextField, Widgets/SearchField, Widgets/CheckboxField, Widgets/NumberStepper, Widgets/RadioOptionGroup, Widgets/TextAreaField).
