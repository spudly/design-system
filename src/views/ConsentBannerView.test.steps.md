---
component: ConsentBannerView
run_when:
  - "src/views/ConsentBannerView.tsx, src/views/InstallBannerView.tsx, their stories, or a changeset naming either view."
---

# ConsentBannerView — manual test steps

Colocated manual test steps for `src/views/ConsentBannerView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ConsentBannerView & InstallBannerView

Open in `Views/ConsentBannerView`: Default; and in
`Views/InstallBannerView`: Default.

1. Consent banner: the message renders with the Privacy
   Policy link inline (a real anchor), Decline before Accept
   in the action row, pinned to the bottom edge.
2. Install banner: pinned to the top edge, message followed by
   the App Store and Google Play links, with a dismiss control
   whose accessible name is "Dismiss install banner".

**Run when:** `src/views/ConsentBannerView.tsx`,
`src/views/InstallBannerView.tsx`, their stories, or a
changeset naming either view.
