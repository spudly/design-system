---
component: StarRatingInput
run_when:
  - "src/widgets/StarRatingInput.tsx, its stories, or a changeset naming StarRatingInput."
---

# StarRatingInput — manual test steps

Colocated manual test steps for `src/widgets/StarRatingInput.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## StarRatingInput

Open in `Widgets/StarRatingInput`: Default, Unrated, WithoutLabel,
DarkTone, AllowClear, ReadOnly, Disabled.

1. Tapping the currently-selected star in AllowClear clears the
   rating back to unrated; in Default (no allow-clear) it does not.
2. DarkTone: stars render in the gold/dark tone treatment and remain
   clearly visible against the story background.
3. ReadOnly shows the value with no interactive affordance;
   Disabled reads as disabled (dimmed) and does not respond.
4. Unrated renders five gray, unselected stars (solid ★
   glyphs) with no partial fill.

**Run when:** `src/widgets/StarRatingInput.tsx`, its stories, or
a changeset naming StarRatingInput.
