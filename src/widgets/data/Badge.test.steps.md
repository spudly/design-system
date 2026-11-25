---
component: Badge
run_when:
  - "src/widgets/data/Badge.tsx, src/widgets/data/Badge.stories.tsx, or a changeset naming Badge (including TagPill-into-Badge changes)."
---

# Badge — manual test steps

Colocated manual test steps for `src/widgets/data/Badge.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Badge

Open in `Widgets/Badge`: Neutral, Info, Success, Warning, Danger,
Mastery, AllTones, Selectable, Selected, SelectableDisabled, Removable,
RemovableDisabled.

1. Every tone renders as a pill with a **visible 1px border in the
   same color as its label text** — no tone is borderless or uses a
   mismatched border color.
2. In AllTones, the six pills align on one baseline with even
   spacing; no pill is taller or wider than its label needs.
3. Long labels (type one in via Controls) wrap or truncate without
   breaking the pill shape or overlapping neighbors.
4. Selectable: Weeknight starts selected (primary fill).
   Pressing a pill toggles it — a pressed pill takes the
   **primary fill with the on-primary label**; pressing a
   selected pill returns it to the resting tint, and pressing
   another pill adds it to the selection (Weeknight stays
   selected). The pills are keyboard-operable:
   Tab reaches them and Enter/Space toggles the focused pill.
5. Selected: the pill renders in the selected treatment and is a
   toggle button (aria-pressed true); in Selectable, unpressed
   pills announce aria-pressed false.
6. The display-only stories (Neutral through AllTones) carry no
   button role and no pressed state — the selectable form is
   opt-in only.
7. SelectableDisabled: the pill is dimmed, Tab skips it, and it
   does not toggle by pointer or keyboard; it still announces
   its pressed and disabled state.
8. Removable: each chip's label is plain text (the chip itself
   is not pressable) and the small × inside the chip is its own
   button, announced as "Remove <label>"; pressing it removes
   that chip only. The × is keyboard-operable: Tab reaches it
   and Enter/Space removes the chip. RemovableDisabled: the
   chip is dimmed, Tab skips its ×, and the × does not remove
   the chip by pointer or keyboard.

**Run when:** `src/widgets/data/Badge.tsx`, `src/widgets/data/Badge.stories.tsx`,
or a changeset naming Badge (including TagPill-into-Badge changes).
