---
"@spudly/ui": major
---

SecretRevealPanel now reads its title, copy label, show-once hint, and dismiss label from the app-supplied voice object instead of hard-coded strings, as tranche 1d of the voice-as-theme system (#539). The title and copyLabel props still override the voice slots when passed. Apps must supply the new secretRevealPanel voice slots through VoiceProvider; Storybook's fixture voice carries the same strings the panel previously hard-coded.
