---
"@spudly/ui": patch
---

SelectField (web, touch): the modal sheet a select opens on touch devices now carries an accessible name — the field's label, or "Select an option" when the field has no label — instead of exposing an unnamed dialog to screen readers (the Tamagui 3.1.9 sheet frame is announced as a dialog). On a @spudly/ui bump, re-check in Storybook: open a SelectField's sheet on a touch-emulated web view and confirm assistive technology announces the field label for the sheet.
