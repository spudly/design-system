---
"@spudly/ui": major
---

FieldColumns is renamed to EqualColumns: the component is a generic row of equal-width columns for any children (fields are one example, not the definition), so its name now states the one guarantee it makes — every column gets an equal share. Files, props type (EqualColumnsProps), barrel export, and story (Widgets/Form/EqualColumns) follow the new name; behavior, the standard 12px gutter, and empty-child handling are unchanged.
