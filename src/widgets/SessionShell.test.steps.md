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

1. ScreenShell: the pinned bar stays fixed while the region
   below scrolls; the surface behind is the shell's paint.
2. ScrollShell: the whole column scrolls inside the surface
   frame, content inset by the standard padding with even
   separation.
3. SessionShell Fixed: heading and actions stay put with a
   short form; Scrollable: a long form scrolls under the
   pinned heading/actions.
4. PinnedHeaderShell: the header block stays pinned while the
   body scrolls beneath it.

**Run when:** any of the four shell components, their stories,
or a changeset naming them.
