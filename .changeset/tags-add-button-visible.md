---
"@spudly/ui": patch
---

Fix TagsPage at narrow widths: on the TagsPage create form (Pages/Eciperay/TagsPage, WithTags and Loading stories), the color swatches and the Add button now fit the container — the swatch field shrinks with its swatches wrapping, and the Add button wraps below the swatches if needed — instead of the Add button overflowing off-screen and being invisible. The ColorPickerField component can now shrink inside a flex row. On a @spudly/ui bump, re-test the TagsPage create form at narrow widths and confirm the Add button is visible.
