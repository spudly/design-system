---
component: Accordion
run_when:
  - "src/widgets/Accordion.tsx, its stories, or a changeset naming Accordion."
---

# Accordion — manual test steps

Colocated manual test steps for `src/widgets/Accordion.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Accordion

Open in `Widgets/Accordion`: Default, FirstOpen, Controlled,
SingleSection.

1. Default: all sections start closed. Opening one section expands
   it with an animated height and closes whichever section was open
   — only one section is ever open at a time. Pressing the open
   section's header closes it, leaving all sections closed.
2. FirstOpen: the first section renders expanded on load, the rest
   closed.
3. Controlled: the "Open section:" line under the accordion tracks
   the open section's name as headers are pressed, and reads "none"
   when all sections are closed.
4. Section headers read as buttons: the chevron points right over
   a closed section and rotates to point down over the open
   one; on web, Tab reaches
   a header and Enter/Space toggles it.

**Run when:** `src/widgets/Accordion.tsx`, its stories, or a
changeset naming Accordion.
