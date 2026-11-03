# Copilot instructions — @spudly/ui design system

This repo is the shared design system (`@spudly/ui`) consumed by multiple apps
(React web + React Native, built on Tamagui). Review pull requests against the
conventions below. Flag violations of these rules; do not flag code that
follows them, even where a different style might be more common elsewhere.

## TypeScript

- Use type aliases (`type X = ...`), never `interface`. One allowlisted
  exception: `TamaguiCustomConfig` must remain an `interface` for declaration
  merging — do not flag it.
- Internal styled-component names must not carry the `Spudly` prefix — flag
  newly introduced ones.

## Component API design

- Components own their styles completely. A DS component must NOT accept
  styling props (no `style`, `className`, margin/padding/color props, or
  Tamagui styling props passed through from callers). Flag any new styling
  prop on a component. Variants and semantic props are the mechanism for
  variation.
- Extracted/shared components must be reusable across apps: flag single-app
  domain concepts baked into component names or prop shapes (e.g. meal/recipe
  domain unions in a shared component). Domain content is supplied by the
  caller as data/props.

## Navigation

- A control that navigates to another page is a link with an `href`;
  otherwise it is a button element with a callback. A component named `*Link`
  that carries the link role must be a real link with an `href` — flag
  callback-only "links". Tabs ship both a link variant (navigating) and a
  button variant (same-page).
- Do not flag the settled exceptions: mutation-then-navigate controls stay
  callback buttons, and a genuinely dynamic back destination keeps its
  callback.

## Layout

- No spacing props in the `spaceBefore`/`spaceAfter` style — spacing is
  controlled by the parent. Flag new ones.
- Centering a single element uses the dedicated `Center` component, not
  Column/Row contortions.
- No `role`/`type`/`variant` prop on `Column`/`Row` — a separate component
  per use case, named for what it contains.

## Icons

- Icons are official Feather SVG path data rendered with `react-native-svg`:
  one module per icon, exported under semantic usage names (e.g. `PrintIcon`,
  `ShareIcon`). Flag hand-drawn glyph paths, icon fonts, and exports named
  after Feather icons.

## Colors

- Tag colors are strictly the `TagColorName` union. Flag raw hex color
  values passed as tag/color props; stored legacy hexes convert only at the
  `tagColorNameForHex` boundary.

## Changesets

- Any user-visible change under `src/**` requires a changeset (in
  `.changeset/`) describing the change in testable, user-visible terms,
  naming the affected pages/components — downstream apps scope their testing
  from these descriptions. Flag `src/**` changes with no changeset.

## Dependencies and lockfile

- `package-lock.json` is never hand-edited; it is regenerated with the
  pinned npm (`npm@10.9.4`, via the `packageManager` field/Corepack). Flag
  lockfile edits inconsistent with the `package.json` changes in the PR.

## Accessibility and states

- New or changed interactive elements need an accessible name/label;
  icon-only controls must be labeled.
- New data surfaces must handle failure and empty states explicitly — no
  silent spinners, and no empty-result message shown when a load failed.
