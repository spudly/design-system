---
component: PresetValueSelector
run_when:
  - "src/widgets/CardRow.tsx, its stories, MealPlansPage's list, or a changeset naming CardRow."
  - "src/widgets/PresetValueSelector.tsx, its stories, the recipe pages' scale rows, or a changeset naming PresetValueSelector."
---

# PresetValueSelector — manual test steps

Colocated manual test steps for `src/widgets/PresetValueSelector.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CardRow

Open in `Widgets/CardRow`: Default, WithAction, TitleOnly.

1. Default: an elevated card with the title in semibold over its
   muted meta line; the text block presses (pointer cursor on
   web) and no action button shows. The "Row presses: N"
   readout under the card increments on a pointer press, and
   focusing the row and pressing Enter or Space increments
   it too.
2. WithAction: a small soft-red action button ("Delete",
   danger tone) sits at the card's right edge, vertically
   centered. Pressing Delete increments only the "Delete
   presses: N" readout — the "Row presses: N" readout does
   not change, so the action press does not trigger the
   row's press.
3. TitleOnly: the card shows the title alone, no meta line and no
   empty gap where it would sit.

**Run when:** `src/widgets/CardRow.tsx`, its stories,
MealPlansPage's list, or a changeset naming CardRow.

## PresetValueSelector

Open in `Widgets/PresetValueSelector`: Default,
CustomSelected.

1. Default: the Scale row shows ½× / 1× / 2× / 3× preset buttons
   at equal width in one non-wrapping row, 1× selected
   (primary-filled, light label), plus the Custom button
   unselected. The Custom label sits on one line (never wrapped
   mid-word) and all five buttons are the same height.
2. CustomSelected: the Custom button shows "2.5×" and is
   selected (primary-filled); no preset is selected.
3. Pressing Custom swaps it in place for a decimal number
   input; entering 4 and blurring out of the selector
   entirely applies 4× (the button returns showing "4×",
   selected) — focus must leave the selector: blurring by
   pressing a preset discards the draft instead; entering
   0 or text commits
   nothing and restores the previous value. On web the Custom
   button carries `aria-pressed` matching its selected state.

**Run when:** `src/widgets/PresetValueSelector.tsx`, its
stories, the recipe pages' scale rows, or a changeset naming
PresetValueSelector.
