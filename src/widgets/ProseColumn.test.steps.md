---
component: ProseColumn
run_when:
  - "src/widgets/ProseColumn.tsx, its stories, the pages that compose ProseColumn (LegalDocumentPage), or a changeset naming ProseColumn."
---

# ProseColumn — manual test steps

Colocated manual test steps for `src/widgets/ProseColumn.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ProseColumn

Open in `Widgets/ProseColumn`: Default.

A ProseColumn is a prose document's centered column, capped at the readable measure.

1. The blocks render full width up to 768px, centered, with a 16px gap between them (LegalDocumentPage's document column is the live case); on a phone-width viewport the cap does not bind.

**Run when:** `src/widgets/ProseColumn.tsx`, its stories,
the pages that compose ProseColumn (LegalDocumentPage), or a changeset
naming ProseColumn.
