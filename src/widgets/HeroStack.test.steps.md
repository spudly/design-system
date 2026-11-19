---
component: HeroStack
run_when:
  - "src/widgets/HeroStack.tsx, its stories, the pages that compose HeroStack (LandingPage), or a changeset naming HeroStack."
---

# HeroStack — manual test steps

Colocated manual test steps for `src/widgets/HeroStack.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## HeroStack

Open in `Widgets/HeroStack`: Default.

A HeroStack is a page hero's stack: a centered heading and subtitle with top breathing room.

1. The heading and subtitle render centered with a 12px gap and 24px of top padding (LandingPage's hero is the live case).

**Run when:** `src/widgets/HeroStack.tsx`, its stories,
the pages that compose HeroStack (LandingPage), or a changeset
naming HeroStack.
