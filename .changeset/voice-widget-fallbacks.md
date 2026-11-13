---
"@spudly/ui": major
---

The remaining widget literals move to the app-supplied voice object, as tranche 1f of the voice-as-theme system (#539): AutocompletePicker's search placeholder, search label, searching status, no-results message, results-count announcement, and Remove labels; Alert's and FixedActionBanner's dismiss labels; BulkSelectToolbar's search placeholder and selection-count text; and the form-field fallbacks — CheckboxSelectList's empty message, SelectField's placeholder and sheet name, ColorPickerField's group and swatch names, StarRatingInput's group name and rated/rate names, and RemovableField's Remove text. Apps must supply the new autocompletePicker, alert, fixedActionBanner, checkboxSelectList, selectField, colorPickerField, starRatingInput, and removableField voice slots (and the extended bulkSelectToolbar slots) through VoiceProvider; Storybook's fixture voice carries the same strings these widgets previously hard-coded, so rendered output is unchanged.
