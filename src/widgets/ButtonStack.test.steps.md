---
component: ButtonStack
run_when:
  - "src/widgets/ButtonStack.tsx, src/widgets/CenteredText.tsx, their stories, HomePage's header, or a changeset naming either."
  - "src/widgets/ButtonStack.tsx, its stories, HomePage's actions, or a changeset naming ButtonStack."
---

# ButtonStack — manual test steps

Colocated manual test steps for `src/widgets/ButtonStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ButtonStack & CenteredText

Open in `Widgets/ButtonStack`: Default;
`Widgets/CenteredText`: Default.

1. ButtonStack: the three buttons stretch full width at an
   even 12px rhythm.
2. CenteredText: the subtitle line centers (each wrapped line
   centered) in the muted ink; the plain line centers in the
   default ink.

**Run when:** `src/widgets/ButtonStack.tsx`,
`src/widgets/CenteredText.tsx`, their stories, HomePage's
header, or a changeset naming either.

## ButtonStack

Open in `Widgets/ButtonStack`: Default.

1. The three buttons stretch full width at an even 12px
   rhythm.

**Run when:** `src/widgets/ButtonStack.tsx`, its
stories, HomePage's actions, or a changeset naming
ButtonStack.
