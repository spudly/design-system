---
component: Toolbar
run_when:
  - src/widgets/Toolbar.tsx, its stories, a fixed-shell page composing it, or a changeset naming Toolbar.
---

# Toolbar — manual test steps

Colocated manual test steps for `src/widgets/Toolbar.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Toolbar

Open in `Widgets/Toolbar`: Default.

1. The status badge and the Version select share one line
   over a hairline divider, the select growing to take the
   bar's remaining width; the bar's inset is 16px at the
   sides and 12px vertically. Narrow the story's frame: the
   select wraps onto a second line instead of overflowing
   the bar.

**Run when:** `src/widgets/Toolbar.tsx`, its stories, a
fixed-shell page composing it, or a changeset naming Toolbar.
