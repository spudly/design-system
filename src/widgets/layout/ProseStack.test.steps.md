---
component: ProseStack
run_when:
  - "src/widgets/layout/ProseStack.tsx, its stories, the pages that compose ProseStack (LegalDocumentPage), or a changeset naming ProseStack."
---

# ProseStack — manual test steps

Colocated manual test steps for `src/widgets/layout/ProseStack.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ProseStack

Open in `Widgets/ProseStack`: Default.

A ProseStack is one prose block's stack: a heading over its contents on the prose rhythm.

1. The subheading and its paragraphs render with a 12px gap (LegalDocumentPage's title block and each section are the live cases).

**Run when:** `src/widgets/layout/ProseStack.tsx`, its stories,
the pages that compose ProseStack (LegalDocumentPage), or a changeset
naming ProseStack.
