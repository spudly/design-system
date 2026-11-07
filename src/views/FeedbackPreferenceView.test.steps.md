---
component: FeedbackPreferenceView
run_when:
  - "src/views/FeedbackPreferenceView.tsx, its stories, ProfilePage, or a changeset naming FeedbackPreferenceView."
---

# FeedbackPreferenceView — manual test steps

Colocated manual test steps for `src/views/FeedbackPreferenceView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FeedbackPreferenceView

Open in `Views/FeedbackPreferenceView`: ConsentAccepted,
PromptOpen, ShortcutUnavailable.

1. ConsentAccepted: the shortcut checkbox is checked, the
   status line reads "Analytics consent: Accepted", Decline
   and Withdraw consent actions render (no Accept), and the
   privacy-choices sentence ends in a real link.
2. PromptOpen: the consent prompt text renders with Decline /
   Accept buttons in place of the action row.
3. ShortcutUnavailable: the checkbox is disabled and the
   unavailable hint shows under it.

**Run when:** `src/views/FeedbackPreferenceView.tsx`, its
stories, ProfilePage, or a changeset naming
FeedbackPreferenceView.
