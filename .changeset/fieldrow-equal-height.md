---
"@spudly/ui": patch
---

FieldRow rows now render the field and its action button at exactly one height: FieldRow stretches its children to the row's common height, and SearchField, TextField, and SelectField fill that height on their `grow` path (the FieldRow Default story's search field and Search button now match).
