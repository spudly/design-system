---
component: NumberStepper
run_when:
  - src/views/NumberStepper.tsx, its stories, or a changeset naming NumberStepper.
---

# NumberStepper — manual test steps

Colocated manual test steps for `src/views/NumberStepper.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## NumberStepper

Open in `Views/NumberStepper`: Default, AtMinBound, AtMaxBound,
CustomStep, Inline, Editable.

1. Exactly **one pair** of step buttons renders — the browser's native
   spin buttons never appear alongside them in the Editable story.
2. AtMinBound: the decrement button reads as disabled and clicking it
   does not move the value below the minimum. AtMaxBound: same for
   increment at the maximum.
3. Stepping in Default/CustomStep moves by 1 / the custom step, and
   the displayed value updates immediately.
4. Clearing the Editable field and blurring commits nothing (the
   value returns to / stays at the last committed value) — an empty
   entry never commits 0 or NaN.

**Run when:** `src/views/NumberStepper.tsx`, its stories, or a
changeset naming NumberStepper.
