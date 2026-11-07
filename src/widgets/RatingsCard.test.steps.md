---
component: RatingsCard
run_when:
  - src/widgets/RatingsCard.tsx, src/widgets/SectionHeading.tsx, their stories, or a changeset naming any of them.
  - src/widgets/RatingsCard.tsx, its stories, PublicRecipePage's engagement block, or a changeset naming RatingsCard.
---

# RatingsCard — manual test steps

Colocated manual test steps for `src/widgets/RatingsCard.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RatingsCard & SectionHeading

Open in `Widgets/RatingsCard`: Default, NoRatingsYet,
Stale; `Widgets/SectionHeading`: Default.

1. RatingsCard Default: the eyebrow label, the community stars
   with the numeric average and rating count, and the viewer's
   own star row; tapping a viewer star updates it.
2. NoRatingsYet: the empty community line renders in place of
   the average; the viewer row still rates.
3. Stale: the stale treatment renders as the story defines it,
   with no layout shift against Default.
4. SectionHeading Default: the heading renders in the
   subheading treatment, flush to its parent's inset — the
   heading itself carries no padding; the story's panel
   supplies the inset.

**Run when:** `src/widgets/RatingsCard.tsx`,
`src/widgets/SectionHeading.tsx`, their stories, or a
changeset naming any of them.

## RatingsCard

Open in `Widgets/RatingsCard`: Default, Stale, No Ratings Yet.

1. Default: the community average shows ("4.6 (9)"); "Your
   rating" shows the viewer's stars — pressing the currently
   selected star clears the rating, and pressing another star
   changes it.
2. Stale: the stale-ratings hint shows under the community
   average and under "Your rating". No Ratings Yet shows "No
   community ratings yet" with an empty star input. The
   signed-out form (no "Your rating" block) is exercised by
   PublicRecipePage's Default story.

**Run when:** `src/widgets/RatingsCard.tsx`, its stories,
PublicRecipePage's engagement block, or a changeset naming
RatingsCard.
