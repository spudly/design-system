---
"@spudly/ui": major
---

BackLink, PrevNextNav, BulkSelectToolbar, and StepOverlay now read their default labels (back/next navigation, select-all/clear-selection actions, and the step overlay's Done label) from the app-supplied voice object instead of hard-coded string defaults, as tranche 1c of the voice-as-theme system (#539). An explicit label prop still overrides the voice slot. Apps must supply the new voice slots through VoiceProvider; Storybook's fixture voice carries the same strings these widgets previously hard-coded.
