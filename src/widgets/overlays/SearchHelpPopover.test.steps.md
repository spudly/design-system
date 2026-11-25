---
component: SearchHelpPopover
run_when:
  - "src/widgets/overlays/SearchHelpPopover.tsx, its stories, or a changeset naming SearchHelpPopover."
---

# SearchHelpPopover — manual test steps

Colocated manual test steps for `src/widgets/overlays/SearchHelpPopover.tsx` (design-system #699).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## SearchHelpPopover

Open in `Widgets/SearchHelpPopover`: Closed, Open, NoIntro.

1. Closed: only the trigger renders — a secondary button with a
   help glyph left of the "Search syntax" label. Pressing it
   opens the panel; pressing it again (or Escape, or an outside
   press) closes it.
2. Open: the panel is titled "Search syntax", shows the intro
   line, then each entry as a mono syntax token beside its
   description; no entry overflows the panel.
3. NoIntro: the panel shows the title and entries with no intro
   line and no empty gap where it would sit.
4. The trigger is keyboard-operable and announces its expanded
   state; on a touch device the panel presents as a bottom sheet.

**Run when:** `src/widgets/overlays/SearchHelpPopover.tsx`, its stories,
or a changeset naming SearchHelpPopover.
