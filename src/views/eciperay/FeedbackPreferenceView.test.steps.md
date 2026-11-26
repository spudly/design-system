---
component: FeedbackPreferenceView
run_when:
  - "src/views/eciperay/FeedbackPreferenceView.tsx, its stories, ProfilePage, or a changeset naming FeedbackPreferenceView."
---

# FeedbackPreferenceView — manual test steps

Colocated manual test steps for `src/views/eciperay/FeedbackPreferenceView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FeedbackPreferenceView

Open in `Views/FeedbackPreferenceView`: ConsentAccepted,
PromptOpen, ShortcutUnavailable, NoConsent, LongLabels.

1. ConsentAccepted: the shortcut checkbox is checked, the
   status line reads "Analytics consent: Accepted", Decline
   and Withdraw consent actions render (no Accept), and the
   privacy-choices sentence ends in a real link.
2. PromptOpen: the consent prompt text renders with Decline /
   Accept buttons in place of the action row.
3. ShortcutUnavailable: the checkbox is disabled and the
   unavailable hint shows under it.
4. NoConsent (#890): no consent props are passed — the
   feedback-preference UI renders with no consent status,
   prompt, or actions.
5. LongLabels (#890): the out-of-prompt actions read
   "Accept analytics consent" / "Decline analytics consent"
   (the long labels), while the prompt keeps the short
   "Accept" / "Decline" pair.

**Run when:** `src/views/eciperay/FeedbackPreferenceView.tsx`, its
stories, ProfilePage, or a changeset naming
FeedbackPreferenceView.
