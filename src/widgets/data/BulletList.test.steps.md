---
component: BulletList
run_when:
  - "src/widgets/data/BulletList.tsx, its stories, the pages that compose BulletList (LegalDocumentPage), or a changeset naming BulletList."
---

# BulletList — manual test steps

Colocated manual test steps for `src/widgets/data/BulletList.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## BulletList

Open in `Widgets/BulletList`: Default.

A BulletList is a bulleted prose list: a bullet glyph beside each item's flexing text.

1. The two items render with an 8px gap between items and between each bullet and its text, the text wrapping beside the bullet (LegalDocumentPage's list blocks are the live case), and the list carries the list/listitem roles on web.

**Run when:** `src/widgets/data/BulletList.tsx`, its stories,
the pages that compose BulletList (LegalDocumentPage), or a changeset
naming BulletList.
