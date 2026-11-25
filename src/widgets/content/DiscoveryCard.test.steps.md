---
component: DiscoveryCard
run_when:
  - "src/widgets/content/DiscoveryCard.tsx, src/widgets/content/DiscoveryCard.stories.tsx, or a changeset naming DiscoveryCard."
---

# DiscoveryCard — manual test steps

Colocated manual test steps for `src/widgets/content/DiscoveryCard.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## DiscoveryCard

Open in `Widgets/Content/DiscoveryCard`: Default, WithActions.

1. **Default** renders the plain link card — thumbnail placeholder,
   title, subtitle — with **no** menu button anywhere on the card.
2. **WithActions** renders the same card with an overflow-menu
   button (three vertical dots) overlaid on the card's trailing
   edge. Activating the button opens a menu listing "Hide this
   recipe" and "Show less like this"; the card does **not**
   navigate when the button or a menu row is activated.
3. With the menu open, pressing Escape closes it and focus returns
   to the menu button. Choosing a row closes the menu.
4. The menu button's accessible name is "Actions for Creamy Tuscan
   Garlic Chicken" (verify with a screen reader or the browser's
   accessibility inspector).
