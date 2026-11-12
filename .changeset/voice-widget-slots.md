---
"@spudly/ui": major
---

CommentItem, RatingsCard, and NutritionPanel now read all of their shared text (action labels, rating headings and stale-rating hints, nutrition headings and actions) from the app-supplied voice object instead of hard-coded strings, as tranche 1b of the voice-as-theme system (#539). Apps must supply voice slots for these widgets through VoiceProvider; Storybook's fixture voice carries the same strings these widgets previously hard-coded.
