---
component: Badge
run_when:
  - "src/widgets/Badge.tsx, src/widgets/Badge.stories.tsx, or a changeset naming Badge (including TagPill-into-Badge changes)."
---

# Badge — manual test steps

Colocated manual test steps for `src/widgets/Badge.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Badge

Open in `Widgets/Badge`: Neutral, Info, Success, Warning, Danger,
AllTones, Selectable, Selected, SelectableDisabled.

1. Every tone renders as a pill with a **visible 1px border in the
   same color as its label text** — no tone is borderless or uses a
   mismatched border color.
2. In AllTones, the five pills align on one baseline with even
   spacing; no pill is taller or wider than its label needs.
3. Long labels (type one in via Controls) wrap or truncate without
   breaking the pill shape or overlapping neighbors.
4. Selectable: pressing a pill toggles it — the pressed pill takes
   the **primary fill with the on-primary label**, the others keep
   the resting tint; pressing it again returns it to the tint.
   Only the pressed pill changes. The pills are keyboard-operable:
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

**Run when:** `src/widgets/Badge.tsx`, `src/widgets/Badge.stories.tsx`,
or a changeset naming Badge (including TagPill-into-Badge changes).
