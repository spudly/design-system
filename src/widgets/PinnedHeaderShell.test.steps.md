---
component: PinnedHeaderShell
run_when:
  - "src/widgets/PinnedHeaderShell.tsx, its stories, MealsHubPage's plans tab, or a changeset naming PinnedHeaderShell."
  - "any of the four shell components, their stories, or a changeset naming them. (namely: ScreenShell, ScrollShell, SessionShell, PinnedHeaderShell)"
---

# PinnedHeaderShell — manual test steps

Colocated manual test steps for `src/widgets/PinnedHeaderShell.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## PinnedHeaderShell

Open in `Widgets/PinnedHeaderShell`: Default.

1. The header block (title over the tab bar) stays pinned at
   the top on the light page background while the content
   region below it scrolls; the header's inset matches the
   page inset (16px sides and top).

**Run when:** `src/widgets/PinnedHeaderShell.tsx`, its
stories, MealsHubPage's plans tab, or a changeset naming
PinnedHeaderShell.

## Page shells (ScreenShell, ScrollShell, SessionShell, PinnedHeaderShell)

Open in `Widgets/ScreenShell`: Default;
`Widgets/ScrollShell`: Default; `Widgets/SessionShell`:
Fixed, Scrollable; `Widgets/PinnedHeaderShell`: Default.

1. ScreenShell: the pinned bar renders above the scroll
   region, outside it, and the surface behind is the shell's
   paint. The Default story's region content is a single
   short paragraph that does not overflow its 480px frame,
   so fixed-while-scrolling is verified structurally here
   (bar outside the ScrollRegion), not by scrolling.
2. ScrollShell: the whole column scrolls inside the surface
   frame, content inset by the standard padding with even
   separation.
3. SessionShell Fixed: the title and hint render as a
   fixed column (neither story has a form or actions);
   Scrollable: the title and the transcript blocks scroll
   together inside the ScrollRegion — the title is not
   pinned.
4. PinnedHeaderShell: the header block stays pinned while the
   body scrolls beneath it.

**Run when:** any of the four shell components, their stories,
or a changeset naming them.
