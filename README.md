# @spudly/ui

The shared design system for Spudly apps — currently **Eciperay** and **Memorize**,
plus any future apps. One brand-neutral core, per-app themes, universal
(React web + React Native) components.

## What's inside

- `src/tokens/` — design tokens: colors, typography, spacing, radii, shadows.
  Single source of truth; every value is plain and serializable. **Currently
  placeholder values** — the design direction step will finalize them.
- `src/themes/` — `baseTheme` (brand-neutral) plus per-app overrides:
  `eciperayTheme`, `memorizeTheme`. Themes override semantic colors and font
  family only, proving the mechanism; real brand values come later.
- `src/components/` — universal components built with
  [Tamagui](https://tamagui.dev) `styled()`. Today: `Button`
  (`variant`: primary | secondary | ghost; `size`: sm | md | lg; `disabled`).
- `src/tamagui.config.ts` — `createTamagui` wiring the tokens in for
  consumers that want `$token` shorthands and `TamaguiProvider`.

## Install (in a consumer app repo)

This package is published **privately** via GitHub Packages. Each app repo needs
one line in its `.npmrc` (create the file at the repo root if absent):

```ini
@spudly:registry=https://npm.pkg.github.com
```

Then:

```sh
npm install @spudly/ui
```

Local auth is a one-time `npm login --registry=https://npm.pkg.github.com`
(or a `//npm.pkg.github.com/:_authToken` line in `~/.npmrc`). CI uses the
built-in `GITHUB_TOKEN` — see `.github/workflows/`.

```tsx
import { Button, createTamaguiConfig, eciperayTheme } from "@spudly/ui";
import { TamaguiProvider } from "tamagui";

// Create the app's config exactly once, in app-owned code outside
// rendering. Tamagui resolves all styling against the config from the
// most recent createTamagui() call, so the package ships factories
// only — never pre-built configs (see src/tamagui.config.ts).
const tamaguiConfig = createTamaguiConfig(eciperayTheme);

<TamaguiProvider config={tamaguiConfig}>
  <Button variant="primary" size="md" onPress={save}>
    Save recipe
  </Button>
</TamaguiProvider>;
```

## How theming works

Components never hardcode app branding. They read the raw `tokens` (or a
theme's `semantic` roles). Each app picks its theme:

```ts
import { eciperayTheme, memorizeTheme } from "@spudly/ui";
```

To theme a new app, copy `src/themes/memorize.ts`, override the semantic
colors and font family, and export it. The base ramp stays shared so
components keep working everywhere.

## Release process

Releases are automated with [Changesets](https://github.com/changesets/changesets):

1. In a PR that changes the package, run `npx changeset` and describe the
   bump (patch/minor/major).
2. Merge to `main`. The `release` workflow opens/updates a "Version Packages"
   PR; merging it publishes to GitHub Packages.
3. Consumers upgrade on their own schedule — Eciperay can stay on 1.4 while
   Memorize tries 2.0.

## Storybook previews (Chromatic)

Every pull request publishes its Storybook build to
[Chromatic](https://www.chromatic.com/) via `.github/workflows/chromatic.yml`:
each run gets a browsable build URL for review, and Chromatic diffs story
snapshots against the accepted `main` baseline. Visual changes show up as a
failing/check-pending Chromatic status until they are accepted in
Chromatic's UI — that acceptance is the visual-regression gate. Pushes to
`main` publish the new baseline.

One-time setup:

1. Create a Chromatic project linked to this GitHub repo (chromatic.com →
   Add project). Chromatic's free tier covers this project's volume.
2. Copy the project token into a repository secret named
   `CHROMATIC_PROJECT_TOKEN` (Settings → Secrets and variables → Actions).
   Until the secret exists, the publish step fails — confined to the
   chromatic check; CI is unaffected.
3. For Dependabot PRs, add the same value as a **Dependabot** secret with
   the same name (Settings → Secrets and variables → Dependabot):
   Dependabot-triggered runs cannot read Actions secrets. Fork PRs are
   skipped entirely — they never receive secrets, by design.

### Full-page demo stories (Pages)

Alongside the component stories, `src/pages/` holds full-page demo
stories for each app's core screens — Eciperay: Recipes browse, Recipe
detail, Meal plans, Shared-with-me; Memorize: Home / verse search,
Passage view, Memorization session, Progress. Component screenshots
alone do not show how the pieces compose on a real screen, so the
pages are composed from the real `@spudly/ui` components, in the app's
brand theme, inside a fixed phone-width frame, and Chromatic
screenshots them on every PR alongside the component stories — a
deliberate layout change to a demo page produces a reviewable
Chromatic diff like any other story. Scope note: these are **web**
screenshots — they guard page composition and web rendering. They
would not have caught spudly/eciperay#162 itself: its root cause was a
native-only SearchField glyph defect that rendered correctly on web
and only exploded under Android's text layout. That native class is
what the on-device Storybook work (issue #43) covers.

Rules for keeping that coverage meaningful:

- Stories render only the static fixtures in `src/pages/fixtures.ts` —
  no network, no real API/auth, no clocks or relative timestamps, no
  external images — so diffs reflect layout, not data churn.
- When a real app screen's layout changes deliberately, update its page
  story in the same spirit: the page stories are the visual spec for
  whole screens, kept here alongside the components they compose.
- On-device (Android) coverage of these pages follows via the
  on-device Storybook work (issue #43).

## Next steps

1. **Design brief** — one page: product personality, audience, adjectives,
   anti-goals (AI drafts, human reacts).
2. **AI visual directions** — generate 3–5 visual directions for key screens,
   pick one.
3. **Finalize tokens** — replace the placeholder ramps/scale with the real
   palette, type scale, radii; verify WCAG contrast on text pairs.
4. **Build primitives** — one at a time (Text, Input, Card, …), each with a
   Storybook story, accessibility props, and visual regression coverage.
5. **Use-case tests** — Playwright (web) + Maestro (native) on the apps.
