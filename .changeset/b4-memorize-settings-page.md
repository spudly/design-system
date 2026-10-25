---
"@spudly/ui": minor
---

Add the B4 Memorize settings page (issue #127): MemorizeSettingsPage,
the controlled view for Memorize's Settings tab — the last of the
app's screens to move into the design system. It renders the
scripture-source card (secure API-key field, Save / Clear actions)
and the Google Drive sync card (Connect / Sync, sync feedback, and
conflict resolution) from display state and callbacks only; the API
key store actions, the Drive OAuth flow, and the sync machinery stay
in the app.
