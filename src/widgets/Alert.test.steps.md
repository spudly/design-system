---
component: Alert
run_when:
  - src/widgets/DismissibleBanner.tsx, src/widgets/InlineAlert.tsx, their stories, or a changeset naming DismissibleBanner, InlineAlert, or Alert.
---

# Alert — manual test steps

Colocated manual test steps for `src/widgets/Alert.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## DismissibleBanner & InlineAlert

Open in `Widgets/DismissibleBanner`: Info, Warning, WithActions —
and `Widgets/InlineAlert`: Info, Success, Warning, Error.

1. The dismiss (×) glyph renders **large and clearly visible** (2xl
   class), centered in its 44px touch target — not a tiny × in the
   corner.
2. Clicking dismiss in the story removes the banner (actions addon /
   story state) without leaving an empty gap band behind.
3. WithActions: the action buttons sit clear of the dismiss target
   and the message text; nothing overlaps at the story width.
4. InlineAlert severity colors: each severity's icon/text treatment
   is distinguishable and the message is readable against its
   background in all four stories.

**Run when:** `src/widgets/DismissibleBanner.tsx`,
`src/widgets/InlineAlert.tsx`, their stories, or a changeset
naming DismissibleBanner, InlineAlert, or Alert.
