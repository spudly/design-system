---
component: Slider
run_when:
  - src/widgets/Slider.tsx, its stories, or a changeset naming Slider.
---

# Slider — manual test steps

Colocated manual test steps for `src/widgets/Slider.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Slider

Open in `Widgets/Slider`: Default, Ticks, CustomRange, WithError,
Disabled.

1. Default: dragging the knob (or focusing it and pressing the arrow
   keys) moves the fill and knob together between the track ends;
   Home/End jump to the minimum/maximum, and the knob never leaves
   the track.
2. Ticks: the ten labels One–Ten sit under the 1–10 track, One flush
   with the left end, Ten flush with the right, the rest centered
   under their values; stepping with the arrow keys moves by 1.
3. CustomRange: arrow keys move by 0.5 (2.5 → 3.0 → 3.5), and the
   three tick labels (0, 2.5, 5) sit at the left end, center, and
   right end of the track.
4. WithError: the error line "Choose a level before continuing."
   renders under the slider in the error color, and the slider still
   drags/steps normally.
5. Disabled: the whole control reads dimmed, the knob cannot be
   dragged or focused, and the value does not change.
6. In every story the knob is a white circle with a visible outline,
   centered on the track, over a brand-primary fill that runs from
   the track's left end to the knob.

**Run when:** `src/widgets/Slider.tsx`, its stories, or a
changeset naming Slider.
