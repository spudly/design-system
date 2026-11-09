---
component: SectionHeading
run_when:
  - "src/widgets/RatingsCard.tsx, src/widgets/SectionHeading.tsx, their stories, or a changeset naming any of them. (namely: RatingsCard, SectionHeading)"
---

# SectionHeading — manual test steps

Colocated manual test steps for `src/widgets/SectionHeading.tsx` (design-system #530).
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
   the average, and no viewer row renders — the story passes
   no viewer and no rating-change handler.
3. Stale: the community and viewer stale notices both
   render (Default renders neither, so the viewer row sits
   lower than in Default); check the notices render
   without overlapping the star rows.
4. SectionHeading Default: the heading renders in the
   subheading treatment, flush to its parent's inset — the
   heading itself carries no padding. In the story the
   padded panel is a sibling of the headings, not their
   parent: it insets only its own content, not the
   headings.

**Run when:** `src/widgets/RatingsCard.tsx`,
`src/widgets/SectionHeading.tsx`, their stories, or a
changeset naming any of them.
