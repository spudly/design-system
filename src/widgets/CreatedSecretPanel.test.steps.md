---
component: CreatedSecretPanel
run_when:
  - "src/widgets/CreatedSecretPanel.tsx, its stories, or a changeset naming CreatedSecretPanel."
---

# CreatedSecretPanel — manual test steps

Colocated manual test steps for `src/widgets/CreatedSecretPanel.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CreatedSecretPanel

Open in `Widgets/CreatedSecretPanel`: Default.

1. The story renders the warning panel with its title, the
   secret selectable in mono inside its surface box, the
   hint, and the Done action, matching the loaded panel the
   access-tokens view composes.

**Run when:** `src/widgets/CreatedSecretPanel.tsx`, its stories, or a
changeset naming CreatedSecretPanel.
