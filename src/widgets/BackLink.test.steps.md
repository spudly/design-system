---
component: BackLink
run_when:
  - "src/widgets/Button.tsx, TextLink.tsx, BackLink.tsx, or Tabs.tsx, their stories, or a changeset naming the navigation link forms or #248."
---

# BackLink — manual test steps

Colocated manual test steps for `src/widgets/BackLink.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

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
naming the navigation link forms or #248.
