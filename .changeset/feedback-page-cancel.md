---
"@spudly/ui": minor
---

FeedbackPage: added an optional cancel affordance (#877) — when the host supplies `onCancel`, a secondary Cancel button renders beside the primary Submit button in a ButtonRow. Its label is the optional `cancelLabel` prop when given, otherwise the shared `voice.common.cancelLabel`. Cancel is not disabled by `submitting` or `submitDisabled`. Hosts that supply no cancel handler render exactly as before, so eciperay hosts can now delete their host-rendered Cancel button and pass the handler through instead.
