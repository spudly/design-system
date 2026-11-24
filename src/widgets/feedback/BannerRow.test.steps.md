---
component: BannerRow
run_when:
  - "src/widgets/feedback/BannerRow.tsx, its stories, the pages that compose BannerRow (LegalDocumentPage), or a changeset naming BannerRow."
---

# BannerRow — manual test steps

Colocated manual test steps for `src/widgets/feedback/BannerRow.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## BannerRow

Open in `Widgets/BannerRow`: Default.

A BannerRow is a frame header's row: its two ends pushed apart and centered against each other.

1. The brand wordmark and the sign-in link render at opposite ends of the row, centered against each other with at least a 16px gap (LegalDocumentPage's header is the live case).

**Run when:** `src/widgets/feedback/BannerRow.tsx`, its stories,
the pages that compose BannerRow (LegalDocumentPage), or a changeset
naming BannerRow.
