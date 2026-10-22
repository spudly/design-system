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

## Visual regression (Playwright)

Every pull request that touches components, tokens, themes, or stories
runs Playwright screenshot tests over the built Storybook — every story,
in both brand themes (Eciperay "Warm Harvest" and Memorize "Quiet Dawn") —
via `.github/workflows/visual.yml`. Baselines are committed in-repo; a
visual diff fails the PR, with diff images uploaded as CI artifacts.

```sh
npm run build-storybook   # the suite enumerates stories from the build
npm run test:visual       # check against committed baselines
npm run test:visual:update  # regenerate baselines after a deliberate change
```

See [docs/visual-regression.md](docs/visual-regression.md) for the full
baseline-update workflow. This setup **replaces Chromatic** (removed in
the same PR): it snapshots the same stories with no external service or
secret, and baselines are reviewable as files in the PR — the doc above
states the reasoning in full.

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
