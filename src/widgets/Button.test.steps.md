---
component: Button
run_when:
  - "src/pages/LandingPage.tsx, its stories, Button's href form, or a changeset naming LandingPage."
  - "src/widgets/Button.tsx, its stories, or a changeset naming Button or the Button icon slot."
  - "src/widgets/Button.tsx, TextLink.tsx, BackLink.tsx, or Tabs.tsx, their stories, or a changeset naming any of Button, TextLink, BackLink, or Tabs, the navigation link forms, or #248."
---

# Button — manual test steps

Colocated manual test steps for `src/widgets/Button.tsx` (design-system #530).
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

## Button

Open in `Widgets/Button`: Primary, Secondary, Ghost, Danger,
Sizes, Disabled, AllVariants, WithIcon, WithIconVariants, IconOnly,
IconOnlyVariants, IconSizes, IconDisabled, IconPressCounter,
Toggle, ToggleStates.

The plain stories (Primary → AllVariants) are the unchanged labeled
button. The icon-slot stories:

1. WithIcon / WithIconVariants: the glyph sits to the **left** of
   the label with an even gap, vertically centered on the label's
   line, inked in the variant's label color — light glyph on the
   primary fill, dark glyph on the secondary gray, primary-
   colored glyph with no fill on ghost (the ghost prop uses
   the default primary variant, so its glyph matches the
   primary label color, not the link color), white glyph on
   the danger fill.
2. IconOnly / IconOnlyVariants: only the glyph renders — no text —
   centered in a square target, in every variant.
3. IconSizes: the labeled row's glyph grows with the button size
   (sm → lg); the icon-only row's squares grow sm → lg with the
   glyph centered in each, and the smallest is still a full 44px
   touch target (compare it with the 44px SearchField clear target
   in `Views/SearchField` — it is no smaller).
4. IconDisabled: both the labeled and the icon-only button render
   dimmed and pressing them does nothing.
5. IconPressCounter: pressing the icon-only button increments the
   "Pressed N times" count; on web, tabbing to the button and
   pressing Enter or Space increments it too.
6. The icon-only button's accessible name is its label: in the
   rendered DOM (or the Storybook accessibility panel) the IconOnly
   story's button carries `aria-label="Print recipe"` and there is
   no `accessibilitylabel` attribute.
7. Toggle: the pill row's selected member is primary-filled with
   a light label; pressing another pill moves the selection and
   the fill. On web the selected button carries
   `aria-pressed="true"` and the others `aria-pressed="false"`.
8. ToggleStates: unselected renders in the resting secondary
   treatment, selected primary-filled, and selected-disabled is
   dimmed and inert.

**Run when:** `src/widgets/Button.tsx`, its stories, or a
changeset naming Button or the Button icon slot.

## Navigation link forms (Button, TextLink, BackLink, Tabs)

Open in `Widgets/Button`: Link, LinkVariants, LinkSizes,
LinkDisabled. Open in `Widgets/TextLink`: Href, HrefInProse.
Open in `Widgets/BackLink`: Href. Open in `Widgets/Tabs`:
LinkNavigation.

The href (link) forms from #248 stage 1 — a navigating control
renders as a real anchor carrying its href:

1. Button Link / LinkVariants / LinkSizes: each renders as an
   anchor (in the DOM it is an `<a>` with the story's href, and
   right-click offers "Open in new tab"), visually identical to
   the corresponding button story — same fill, label color,
   padding, and size steps. LinkDisabled renders dimmed and is
   not followable (no href in the DOM).
2. TextLink Href / HrefInProse: the links carry their hrefs and
   keep the link color and underline, inline in the prose.
   TextLink Muted: the same link in the muted treatment (the
   theme's muted ink, still underlined) — the de-emphasized
   treatment the auth forms' "Forgot password?" and "Back to
   sign in" links render in.
3. BackLink Href: the drawn arrow and label render inside one
   anchor with the href; the arrow stays centered on the label's
   line, as in the Default story.
4. Tabs LinkNavigation: all four tabs are anchors with hrefs;
   Search (the current tab) carries the active underline and
   label treatment. The button-variant stories (RecipeDetail,
   AppNavigation) still switch the selection in place.

**Run when:** `src/widgets/Button.tsx`, `TextLink.tsx`,
`BackLink.tsx`, or `Tabs.tsx`, their stories, or a changeset
naming any of Button, TextLink, BackLink, or Tabs, the
navigation link forms, or #248.
