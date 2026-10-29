# The two storybooks

The design system has exactly two storybooks — a **react storybook**
(web) and a **react-native storybook** — over one shared set of CSF
story files in `src/`. Neither is the "main" one: the react storybook
is the web rendering surface (Chromatic), the react-native storybook
is the native rendering surface (Android visual regression), and a
component or page is only covered when it appears in both. This
structure is B1 of the design-system completion program (#121,
#122).

## The pair

|                     | React storybook (web)                                                                                                   | React Native storybook                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Config              | `.storybook/` at the repo root                                                                                          | `apps/storybook/.rnstorybook/`                                                                                 |
| Renderer            | `@storybook/react-vite`                                                                                                 | `@storybook/react-native` in the Expo host app `apps/storybook`                                                |
| Stories glob        | `../src/**/*.stories.@(ts                                                                                               | tsx)`                                                                                                          | `../../../src/**/*.stories.@(ts | tsx)` (same tree) |
| Inclusion mechanism | Storybook indexer over the glob                                                                                         | Generated `.rnstorybook/storybook.requires.ts` (Metro `require.context` over the same glob)                    |
| Dev command         | `npm run storybook:react` (repo root)                                                                                   | `npm run storybook:react-native` (repo root or in `apps/storybook`)                                            |
| Build command       | `npm run build-storybook:react`                                                                                         | The host app build (Expo); registry refresh: `npm run generate` in `apps/storybook`                            |
| CI                  | `.github/workflows/chromatic.yml` — publishes to Chromatic                                                              | `.github/workflows/android-storybook.yml` — emulator captures vs baselines                                     |
| Publish trigger     | Push to `main` always; PRs only via the `visual-check` label (see [README](../README.md#react-storybook-web-chromatic)) | Path-filtered PR runs + `workflow_dispatch` (see [android-visual-regression.md](android-visual-regression.md)) |

The legacy script names `storybook` and `build-storybook` still work
as aliases for the react storybook commands — Chromatic's action
builds with the default `build-storybook` script name, so that alias
must not be removed.

## One story set, two renderers

Stories are platform-neutral CSF (Tamagui views only) living next to
the code they cover:

- Widget components: `src/components/<Name>.stories.tsx`, titled
  `Components/<Name>`.
- Page components: `src/pages/<Name>.stories.tsx`, titled
  `Pages/Eciperay/<Name>` or `Pages/Memorize/<Name>` — page stories
  are organized by app in both storybooks (#70). The two
  `Pages/Eciperay` / `Pages/Memorize` collections
  (`EciperayPages.stories.tsx`, `MemorizePages.stories.tsx`) are
  composed overview demos from #44; each page component additionally
  has its own stories rendering the real page with fixture props
  (#49).
- Preview/decorator setup is mirrored per storybook (`.storybook/preview.tsx`
  and `apps/storybook/.rnstorybook/preview.tsx`): same `theme` global
  shape, different Tamagui config factory — the web combined config's
  CSS-variable font stacks are invalid on native (see
  `src/tamagui.config.ts`).

Because both storybooks load the identical files, a story added for
one side exists on the other — what differs is only whether it
renders correctly there, which is what the two CI systems check.

One deliberate behavioral difference: link presses. Stories carry
web-style app hrefs (`/recipes/...`) because the story set is
shared, but on native a scheme-less href has no handler —
`Linking.openURL` rejects and the press would do nothing. The
native host app absorbs this at its platform boundary
(`apps/storybook/storyLinks.ts`, #300): it wraps `Linking.openURL`
so app-style paths route to the host's own `spudlyds://browse`
scheme with the original path attached (logged as `DS LINK
<path>`), while scheme-bearing URLs (https:, mailto:, the capture
links) pass through untouched. The components' contract is
unchanged — hrefs are still forwarded verbatim; real native apps
pass scheme-bearing URLs of their own.

## Coverage parity

Every widget component exported from `src/components/index.ts` and
every page component exported from `src/pages/index.ts` must have
stories — and therefore appears in both storybooks. Parity is
enforced by `test/storybookParity.test.mjs` (run by `npm test` and
CI), which fails when:

- a widget or page module has no sibling `.stories.tsx`, or its title
  breaks the organization above;
- the two configs' stories globs diverge;
- the committed `storybook.requires.ts` no longer matches the
  react-native config glob (regenerate: `npm run generate` in
  `apps/storybook`);
- a story file exports no stories.

Exceptions — files that are not components/pages and carry no
stories, by design:

- `src/components/accessibility.ts` — ARIA helper utilities.
- `src/pages/PageFrame.tsx` — internal page scaffolding shared by
  the page components; not exported from `@spudly/ui/pages`, and
  exercised through every page story.
- `src/pages/fixtures.ts` — the static fixtures the page stories
  render.

If a future component is genuinely single-platform, the exception
belongs in the parity test with the reason recorded — not in a
one-sided story file, which the shared glob makes impossible anyway.

## Which CI proves what

- **React storybook** — Chromatic snapshots the web rendering
  (TurboSnap-scoped, label-gated on PRs per the #52 cost model). A
  story that fails to load on web fails the Chromatic build.
- **React Native storybook** — the Android VR workflow builds the
  host app, reads the app's runtime story index, and captures every
  **page** story (plus the narrow RecipesPage variant) against
  committed baselines. Widget stories are bundled into the host app
  (a story that fails to load breaks the app build) and browsable on
  device, but are not screenshot-compared — page-level VR is the
  agreed native gate (#121 rule 4).
