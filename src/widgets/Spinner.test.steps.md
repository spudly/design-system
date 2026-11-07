---
component: Spinner
run_when:
  - "src/widgets/Spinner.tsx, its stories, or a changeset naming Spinner."
---

# Spinner — manual test steps

Colocated manual test steps for `src/widgets/Spinner.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Spinner

Open in `Widgets/Spinner`: Default, Large, Determinate,
DeterminateComplete, DeterminateLarge, DeterminateStates.

1. Default and Large still spin continuously (indeterminate); Large
   is visibly bigger than Default.
2. Determinate (value 65) does NOT spin: it shows a static ring
   filled about two-thirds, the arc starting at the top and running
   clockwise, in the brand primary over the lighter progress-track
   ring.
3. DeterminateStates: the five rings fill 0 / 25 / 50 / 75 / 100 —
   0 is the empty track only, 50 fills exactly the right half, 100
   is a complete ring with no gap.
4. DeterminateComplete (100) matches the full ring in
   DeterminateStates; DeterminateLarge (30) shows the same ring at
   the large size.
5. Dragging the `value` control in Determinate moves the arc
   smoothly between the states above; setting `size` to large grows
   the ring without changing its proportions.

**Run when:** `src/widgets/Spinner.tsx`, its stories, or a
changeset naming Spinner.
