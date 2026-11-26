---
"@spudly/ui": minor
---

FeedbackPreferenceView: the analytics-consent block is now optional — a host that supplies no consent props (no `consent`, `onAcceptConsent`, or `onDeclineConsent`) gets the feedback-preference UI with no consent status, prompt, or actions, so the app profile section can adopt the view without inventing consent state (#890). The out-of-prompt consent actions can also carry separate long labels via `acceptLongLabel` / `declineLongLabel`, distinct from the prompt's short `acceptLabel` / `declineLabel` pair; each long label falls back to its short label, so existing consumers passing consent props with a single label set render unchanged. Verify after adopting: a consumer with no consent props shows no consent block, a consumer passing long labels shows them outside the prompt and the short labels inside it, and existing consent consumers are unchanged.
