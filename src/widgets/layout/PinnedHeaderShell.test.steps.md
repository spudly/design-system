---
component: PinnedHeaderShell
run_when:
  - "src/widgets/layout/PinnedHeaderShell.tsx, its stories, MealsHubPage's plans tab, or a changeset naming PinnedHeaderShell."
  - "any of the three shell components, their stories, or a changeset naming them. (namely: ScrollShell, SessionShell, PinnedHeaderShell)"
---

# PinnedHeaderShell — manual test steps

Colocated manual test steps for `src/widgets/layout/PinnedHeaderShell.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## PinnedHeaderShell

Open in `Widgets/PinnedHeaderShell`: Default.

1. The header block (title over the tab bar) stays pinned at
   the top on the light page background while the content
   region below it scrolls; the header's inset matches the
   page inset (16px sides and top).

**Run when:** `src/widgets/layout/PinnedHeaderShell.tsx`, its
stories, MealsHubPage's plans tab, or a changeset naming
PinnedHeaderShell.

## Page shells (ScrollShell, SessionShell, PinnedHeaderShell)

Open in `Widgets/ScrollShell`: Default; `Widgets/SessionShell`:
Fixed, Scrollable; `Widgets/PinnedHeaderShell`: Default. The
fixed-shell frame (the retired ScreenShell, inlined by #741)
is exercised through `Pages/Eciperay/RecipeDetailPage`:
Loading, Default.

1. The inlined page frame: on Loading, the skeleton toolbar
   renders above the scroll region, outside it, and the
   surface behind is the frame's paint; on Default the whole
   page scrolls as one region on that paint. The frame has no
   story of its own since #741 — verify the structure here
   (bar outside the ScrollRegion), not by scrolling.
2. ScrollShell: the whole column scrolls inside the surface
   frame, content inset by the standard padding with even
   separation.
3. SessionShell Fixed: the title and hint render as a
   fixed column (neither story has a form or actions);
   Scrollable: the title and the transcript blocks scroll
   together inside the ScrollRegion — the title is not
   pinned. The story renders with no definite-height frame
   in the Storybook preview, so it may grow to its full
   height there instead of scrolling independently — verify
   the scroll structurally (title and blocks inside the
   ScrollRegion), or in a definite-height frame, rather than
   reporting the preview's lack of overflow as a failure.
4. PinnedHeaderShell: the header block stays pinned while the
   body scrolls beneath it.

**Run when:** any of the three shell components, their stories,
or a changeset naming them.
