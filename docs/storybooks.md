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

|                     | React storybook (web)                                                                                                   | React Native storybook                                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Config              | `.storybook/` at the repo root                                                                                          | `apps/storybook/.rnstorybook/`                                                                                                                                                                            |
| Renderer            | `@storybook/react-vite`                                                                                                 | `@storybook/react-native` in the Expo host app `apps/storybook`                                                                                                                                           |
| Stories glob        | `../src/**/*.stories.@(ts                                                                                               | tsx)`                                                                                                                                                                                                     | `../../../src/**/*.stories.@(ts | tsx)` (same tree) |
| Inclusion mechanism | Storybook indexer over the glob                                                                                         | Generated `.rnstorybook/storybook.requires.ts` (Metro `require.context` over the same glob)                                                                                                               |
| Dev command         | `npm run storybook:react` (repo root)                                                                                   | `npm run storybook:react-native` (repo root or in `apps/storybook`)                                                                                                                                       |
| Build command       | `npm run build-storybook:react`                                                                                         | The host app build (Expo); registry refresh: `npm run generate` in `apps/storybook`                                                                                                                       |
| CI                  | `.github/workflows/chromatic.yml` — publishes to Chromatic                                                              | `.github/workflows/android-storybook.yml` — emulator captures vs baselines; `.github/workflows/chromatic-rn.yml` — publishes to the Chromatic React Native project (#302)                                 |
| Publish trigger     | Push to `main` always; PRs only via the `visual-check` label (see [README](../README.md#react-storybook-web-chromatic)) | Android VR: path-filtered PR runs + `workflow_dispatch`; Chromatic RN: push to `main` always, PRs only via the `visual-check-rn` label (see [android-visual-regression.md](android-visual-regression.md)) |

The legacy script names `storybook` and `build-storybook` still work
as aliases for the react storybook commands — Chromatic's action
builds with the default `build-storybook` script name, so that alias
must not be removed.

## One story set, two renderers

Stories are platform-neutral CSF (Tamagui views only) living next to
the code they cover:

- Widget components: `src/components/<Name>.stories.tsx`, titled
  `Components/<Name>`.
- View components: `src/views/<Name>.stories.tsx`, titled
  `Views/<Name>` — the page fragments pages share, forms included
  (#438 Part 2).
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
so app-style paths route to the host's browse URL with the
original path attached (logged as `DS LINK <path>`), while
scheme-bearing URLs (https:, mailto:, the capture links) pass
through untouched. The browse URL is built with expo-linking's
`createURL`, so it matches how the host was started —
`spudlyds://browse` in a native build, the `exp://…/--/browse`
form under `expo start` in Expo Go, which registers no custom
scheme. The components' contract is unchanged — hrefs are still
forwarded verbatim; real native apps pass scheme-bearing URLs of
their own.

## Coverage parity

Every widget component exported from `src/components/index.ts`,
every view component exported from `src/views/index.ts`, and
every page component exported from `src/pages/index.ts` must have
stories — and therefore appears in both storybooks. Parity is
enforced by `test/storybookParity.test.ts` (run by `npm test` and
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
- `src/components/PageFrame.tsx` — internal page-story scaffolding
  shared by the page stories; not exported from `@spudly/ui`, and
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
- **React Native storybook (Chromatic, #302)** — since #302 the RN
  storybook also publishes to a separate Chromatic React Native
  project, which captures the full story set on Chromatic's hosted
  Android Emulator (the host app is Android-only) and diffs against baselines accepted in
  Chromatic's UI. It runs **in parallel** with the Android VR above:
  the in-repo pipeline remains the authoritative native gate during
  the parallel period, and decommissioning it (if ever) is a separate
  later decision. TurboSnap is not supported for React Native, so
  each Chromatic RN build snapshots the full story set — PR runs are
  therefore gated behind the one-shot `visual-check-rn` label (see
  [android-visual-regression.md](android-visual-regression.md)).
