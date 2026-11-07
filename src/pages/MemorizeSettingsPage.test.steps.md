---
component: MemorizeSettingsPage
run_when:
  - src/pages/MemorizeSettingsPage.tsx, its stories, or a changeset naming MemorizeSettingsPage.
---

# MemorizeSettingsPage — manual test steps

Colocated manual test steps for `src/pages/MemorizeSettingsPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## MemorizeSettingsPage

Open in `Pages/Memorize/MemorizeSettingsPage`: Default.

1. Only the "Settings" heading renders in the shell — there is
   no API key section (no key field, no Save/Clear key actions)
   anywhere on the page (#439).
2. There is no Google Drive sync card or Drive action anywhere
   on the page (#424).

**Run when:** `src/pages/MemorizeSettingsPage.tsx`, its stories, or a
changeset naming MemorizeSettingsPage.
