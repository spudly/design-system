---
component: CardStack
run_when:
  - src/widgets/CardStack.tsx, its stories, the pages that compose CardStack (MealPlansPage), or a changeset naming CardStack.
---

# CardStack — manual test steps

Colocated manual test steps for `src/widgets/CardStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CardStack

Open in `Widgets/CardStack`: Default.

A CardStack is a stack of cards — a list whose rows are cards.

1. The three cards stack with an even 8px gap between them,
   each keeping its own internal padding and full width
   (MealPlansPage's plan list is the live case, including the
   first card's danger Delete action).

**Run when:** `src/widgets/CardStack.tsx`, its stories, the
pages that compose CardStack (MealPlansPage), or a changeset
naming CardStack.
