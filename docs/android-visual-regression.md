# Android on-device Storybook + visual regression

Issue #43. The web Storybook is gated by Chromatic; this system is its
on-device counterpart: the **same CSF stories** rendered in a real
Android app and screenshot-compared in CI. It exists because the
class of bug it catches — React Native measuring/rendering text
differently than the web — is invisible to web screenshots:
spudly/eciperay#162 (the SearchField glyph whose line box stretched
the field to 1826px on a Pixel 8a) passed every web check.

## Pieces

| Piece            | Where                                                              | What it does                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host app         | `apps/storybook/`                                                  | Expo (SDK 58) app mounting @storybook/react-native v10 with the repo's stories. Also the capture target for the VR driver.                                                                                                                                                      |
| On-device config | `src/tamagui.config.ts` → `createOnDeviceStorybookTamaguiConfig()` | Combined three-brand config (base, Warm Harvest, Quiet Dawn) with native font registrations. The web combined config uses CSS-variable font stacks, invalid on native. One process-wide config either way — Tamagui cannot swap brand configs at runtime (spudly/eciperay#149). |
| Preview          | `apps/storybook/.rnstorybook/preview.tsx`                          | Mirrors the web preview: a `theme` global (the six sub-theme names, e.g. `light_warmHarvest`, `dark_quietDawn`) drives `defaultTheme`, keyed remount per theme.                                                                                                                 |
| VR driver        | `tools/visual-regression/run.mjs`                                  | Drives the app over ADB, captures screenshots, pixel-compares against baselines. Zero dependencies (own PNG codec in `png.mjs`, validated round-trip against PIL).                                                                                                              |
| Baselines        | `tools/visual-regression/baselines/<theme>/<storyId>.png`          | Committed reference screenshots.                                                                                                                                                                                                                                                |
| Sanity patch     | `tools/visual-regression/sanity/searchfield-162.patch`             | Reintroduces the #162 bug for the sanity job.                                                                                                                                                                                                                                   |
| CI               | `.github/workflows/android-storybook.yml`                          | Emulator capture/compare job + sanity job (below).                                                                                                                                                                                                                              |

Fonts: the app loads the same faces the apps register — Raleway
(variable TTF, all themes' body/heading) and Alegreya (variable TTF,
Quiet Dawn verse) — from `apps/storybook/assets/fonts/` (OFL license
files alongside). The config resolves them per platform via the
tokens' `fontFamilyNative`/`verseFontFamilyAndroid` names, exactly as
the apps do.

Known deviation: config fonts are global, so the on-device combined
config takes its verse font from Memorize's family — base/Warm
Harvest verse-role text renders Alegreya on device instead of the
generic serif. Stories-only, and no Warm Harvest surface ships verse
text. Web keeps the per-brand stacks.

## Stories on device

Stories are shared verbatim with web: `apps/storybook/.rnstorybook/main.ts`
globs `../../src/**/*.stories.@(ts|tsx)`. They must stay
platform-neutral:

- Wrappers are Tamagui views (`View`/`XStack`/`YStack`), never `<div>`
  or other DOM elements — React Native rejects unknown host
  components at runtime. (The #43 conversion replaced every `<div>`
  story wrapper; keep it that way.)
- No `document.`/`window.` in stories.
- Raw text goes inside a `Text` component, never directly in a view.

## Running locally

Requires a JDK 17 + Android SDK + emulator (or a device) — none of
which the CI-less dev VM for this repo provides; the emulator run
happens in CI.

```sh
cd apps/storybook
npm install
npm run generate          # writes .rnstorybook/storybook.requires.ts
npx expo start            # then open on an Android emulator/device
```

For a native build instead of Expo Go-style loading:
`npx expo run:android`.

## Capture protocol

`apps/storybook/App.tsx` has two modes:

- **Browse mode** (default): the Storybook UI, both brands selectable
  via the `theme` global.
- **Capture mode**: open `spudlyds://capture/<storyId>?theme=<subTheme>&nonce=<n>`.
  The app renders ONLY that story (no Storybook chrome, LogBox
  suppressed), and once fonts are loaded and the story is mounted it
  logs `DSVR READY <nonce> <storyId>` (ReactNativeJS tag). At boot it
  also logs its story index: `DSVR INDEX_BEGIN <count>`, one
  `DSVR INDEX_ITEM <storyId>` per story, `DSVR INDEX_END`.

The driver (`run.mjs`) force-stops and launches the app, reads the
index, then for each theme × story: sends the capture deep link,
waits for the READY line with the matching nonce, settles, and takes
`adb exec-out screencap -p`.

### Capture matrix

Default themes: `light_warmHarvest`, `dark_warmHarvest`,
`light_quietDawn`, `dark_quietDawn` — each brand in both schemes. The
plain base themes are the web default for component stories and can
be added with `--themes light,dark,...`. Pages pin their brand theme
via story globals on web; in capture mode the driver's theme wins
(page stories render the brand the driver asks for — that is the
point of capturing them under their own brand).

Comparison: a pixel differs when any channel delta exceeds
`--threshold` (default 16/255); a screenshot fails when differing
pixels exceed `--max-ratio` (default 0.1%). Diff visualizations
(failed pixels in red over a dimmed baseline) are written to
`<out>/diff/`.

Determinism controls (CI script and recommended locally): fixed
emulator profile (pixel_6, API 34, google_apis x86_64), `wm density
320`, `font_scale 1.0`, animations disabled, SwiftShader GPU (same
rasterizer locally and in CI only if your machine also uses software
rendering — baselines are generated BY the CI job, so they are
self-consistent; do not commit baselines captured on a physical
device).

## Baselines: generating and updating

Baselines are created by the CI job, never by hand-editing images:

1. **First run / new stories**: the compare job passes with `WARN …
no baseline yet` lines and a BOOTSTRAP note while baselines are
   missing — capture still runs, so a story that crashes the app
   fails the job even before it has a baseline.
2. **Regenerate deliberately**: dispatch the workflow
   (Actions → "Android Storybook VR" → Run workflow) with
   mode = `update`. It captures everything, uploads the fresh
   screenshots as the `dsvr-baselines` artifact, and does not compare.
3. Download the artifact, replace `tools/visual-regression/baselines/`
   with its contents, and commit on a PR like any other change. The
   next compare run is strict for every story that has a baseline.
4. An intentional visual change follows the same flow: the compare
   job fails with diff images in the `dsvr-output` artifact — inspect
   them, and if the change is intended, run the update dispatch and
   commit the new baselines in the same PR.

Locally (with an emulator): `node tools/visual-regression/run.mjs --update`.

## The #162 sanity check

Acceptance requires proof the pipeline catches the bug class it
exists for. `tools/visual-regression/sanity/searchfield-162.patch`
reintroduces the bug into `src/components/SearchField.tsx`: the drawn
shapes glyph becomes the pre-fix text glyph with a numeric
`lineHeight` equal to its `fontSize` (the exact pattern
`test/glyph-line-height.test.mjs` bans in committed source), and the
post-#162 clip-box hardening (`height: 44; overflow: hidden` on the
glyph box) is removed. On web this renders identically (a web line
box honors lineHeight exactly); on Android the text glyph's line box
mis-measures and stretches the field — the asymmetry that shipped
#162.

The `sanity` CI job: captures the SearchField stories clean, applies
the patch, recaptures (Metro rebundles — no native rebuild), and
compares the two captures. **The job succeeds only if the comparison
FAILS.** Run it by dispatching the workflow with mode = `sanity`, or
by adding the `android-sanity` label to a PR. If SearchField changes
so the patch no longer applies, the job fails at `git apply` —
refresh the patch (edit the file the same way, `git diff` it into
the patch file, revert) in the same PR.

## CI scoping

The workflow is path-filtered to `src/**`, `apps/storybook/**`,
`tools/visual-regression/**` and itself, because Actions minutes are
on paid overage until 2026-11-01 and an emulator job is the most
expensive kind. It builds a **debug** APK and serves the JS bundle
from Metro inside the job, so the sanity job's mutation needs no
native rebuild — a force-stop and relaunch re-fetches the bundle.
