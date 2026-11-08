---
component: LandingPage
run_when:
  - "src/pages/LandingPage.tsx, its stories, Button's href form, or a changeset naming LandingPage."
---

# LandingPage — manual test steps

Colocated manual test steps for `src/pages/LandingPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## LandingPage

Open in `Pages/Eciperay/LandingPage`: Default, Wide.

1. The headline renders centered as the level-1 heading, with
   the muted subtitle centered under it and breathing room
   above the headline.
2. The three CTAs are Button's href form (`<Button href>` —
   the ButtonLink form; there is no CtaLink): the primary CTA
   is the filled brand button link, the two secondaries are
   neutral button links, all real links (role link, their
   hrefs), never buttons. On web in a consumer that compiles Tamagui they sit in one centered row (check in Wide in such a compiled environment); the root Chromatic Storybook runs no Tamagui compiler, so its Wide story may render the CTAs stacked vertically instead — do not report that stacking as a failure there. On native (the RN storybook) they stack
   vertically — the row never wraps two CTAs side by side at
   phone width.
3. Feature cards: in Wide the three cards share one row, each
   with its title as a level-2 heading and the muted
   description under it; in Default (the 430px phone viewport)
   they wrap onto further rows at their 260px basis instead
   of squeezing — three-across cannot fit there.

**Run when:** `src/pages/LandingPage.tsx`, its stories,
Button's href form, or a changeset naming LandingPage.
