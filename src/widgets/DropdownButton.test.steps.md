---
component: DropdownButton
run_when:
  - "src/widgets/DropdownButton.tsx, its stories, or a changeset naming DropdownButton."
---

# DropdownButton — manual test steps

Colocated manual test steps for `src/widgets/DropdownButton.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## DropdownButton

Open in `Widgets/DropdownButton`: Labeled, WithIcon, IconOnly,
Variants, Disabled. Each story's button is the trigger of a small
dropdown whose panel reads "Menu content".

1. Labeled: the label sits left of a chevron pointing down; opening
   the menu flips the chevron up.
2. WithIcon: the share glyph renders left of the label, the chevron
   after it, all in the secondary variant's ink.
3. IconOnly: no label text — profile glyph plus chevron — and the
   button's accessible name is "Account menu".
4. Variants: Primary, Secondary, and Ghost triggers each open their
   menu; the chevron takes the variant's label color (light on the
   primary fill, dark gray on the secondary gray and on
   ghost — the Ghost trigger is the default secondary
   variant with the ghost treatment).
5. Disabled: the trigger renders dimmed and pressing it does not
   open the menu.

**Run when:** `src/widgets/DropdownButton.tsx`, its stories, or
a changeset naming DropdownButton.
