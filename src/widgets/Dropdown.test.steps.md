---
component: Dropdown
run_when:
  - src/widgets/Dropdown.tsx, its stories, or a changeset naming Dropdown.
---

# Dropdown — manual test steps

Colocated manual test steps for `src/widgets/Dropdown.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Dropdown

Open in `Widgets/Dropdown`: ActionMenu, IconOnlyTrigger,
AlignEnd, SideTop, InitiallyOpen, Controlled.

1. ActionMenu: pressing "Recipe actions" opens the panel anchored
   under the button (surface fill, bordered, shadowed), the
   trigger's chevron flips up while open, and pressing the trigger
   again closes it. Pressing outside the panel, or pressing Escape
   on web, also closes it — and on web, closing with Escape returns
   focus to the trigger button (keep tabbing from where the menu
   was opened, not from the top of the page).
2. ActionMenu rows: choosing "Print recipe" closes the menu and the
   line under it reads "Last action: Print recipe" (close-on-select);
   "Delete recipe" renders in the danger color. Rows are at least
   44px tall; on web, Tab reaches a row and Enter/Space activates it.
3. IconOnlyTrigger: the trigger is the profile glyph plus chevron
   with no text, and its accessible name is "Account menu".
4. AlignEnd: the panel's trailing edge lines up with the trigger's
   trailing edge (the panel extends left from the button).
5. SideTop: the panel opens above its trigger instead of below.
6. InitiallyOpen: the panel renders open on load, rows visible
   without any press.
7. Controlled: the "Menu is open/closed" line tracks the menu as it
   is toggled, and "Open from outside" opens it — the host owns the
   state.

**Run when:** `src/widgets/Dropdown.tsx`, its stories, or a
changeset naming Dropdown.
