---
component: ScrollShell
run_when:
  - "any of the three shell components, their stories, or a changeset naming them. (namely: ScrollShell, SessionShell, PinnedHeaderShell)"
  - "src/widgets/layout/ScrollShell.tsx, its stories, RecipeDetailPage's guest mode, or a changeset naming ScrollShell."
---

# ScrollShell — manual test steps

Colocated manual test steps for `src/widgets/layout/ScrollShell.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

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

## ScrollShell

Open in `Widgets/ScrollShell`: Default.

1. The shell's blocks sit 16px from the shell frame's edges
   (the edges of the story's 430px frame — not the Storybook
   canvas edges, which sit a further 24px out from the
   preview's padding) and 16px from each other, on a surface
   background that fills the frame; the content scrolls as
   one region when it overflows.

**Run when:** `src/widgets/layout/ScrollShell.tsx`, its stories,
RecipeDetailPage's guest mode, or a changeset naming ScrollShell.
