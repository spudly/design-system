---
component: SessionShell
run_when:
  - "any of the four shell components, their stories, or a changeset naming them. (namely: ScreenShell, ScrollShell, SessionShell, PinnedHeaderShell)"
---

# SessionShell — manual test steps

Colocated manual test steps for `src/widgets/SessionShell.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

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
   pinned. The story renders with no definite-height frame
   in the Storybook preview, so it may grow to its full
   height there instead of scrolling independently — verify
   the scroll structurally (title and blocks inside the
   ScrollRegion), or in a definite-height frame, rather than
   reporting the preview's lack of overflow as a failure.
4. PinnedHeaderShell: the header block stays pinned while the
   body scrolls beneath it.

**Run when:** any of the four shell components, their stories,
or a changeset naming them.
