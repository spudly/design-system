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
import { Button, tokens, eciperayTheme } from "@spudly/ui";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "@spudly/ui";

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
