---
"@spudly/ui": patch
---

fix(components): SelectField value and item text now render at the shared field-value size (fontSize.md, 16px) instead of sm (14px), matching TextField/SearchField/MultilineField so the RecipesPage and SharedWithMePage filter bars no longer mix font sizes (design-system#67)
