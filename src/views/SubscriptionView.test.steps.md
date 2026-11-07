---
component: SubscriptionView
run_when:
  - src/views/SubscriptionView.tsx, its stories, ProfilePage, or a changeset naming SubscriptionView.
---

# SubscriptionView — manual test steps

Colocated manual test steps for `src/views/SubscriptionView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## SubscriptionView

Open in `Views/SubscriptionView`: Active, FreeUpsell, Loading.

1. Active: plan name, status line, Manage subscription and
   Check again buttons, and the portal link render on the
   elevated card. FreeUpsell shows the upsell line and its
   manage action only. Loading shows the spinner with its
   "Loading subscription…" line.

**Run when:** `src/views/SubscriptionView.tsx`, its stories,
ProfilePage, or a changeset naming SubscriptionView.
