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
| VR driver        | `tools/visualRegression/run.mjs`                                   | Drives the app over ADB, captures screenshots, pixel-compares against baselines. Zero dependencies (own PNG codec in `png.mjs`, validated round-trip against PIL).                                                                                                              |
| Luminance guard  | `tools/visualRegression/guard.mjs`                                 | Pre-commit check on fresh captures: rejects a set that looks uniformly dimmed or scrimmed (issue #101) before CI may turn it into baselines (below).                                                                                                                            |
| Baselines        | `tools/visualRegression/baselines/<theme>/<storyId>.png`           | Committed reference screenshots. The narrow-viewport variant's baselines sit in the same folders with a `-narrow` filename suffix.                                                                                                                                              |
| Sanity patch     | `tools/visualRegression/sanity/searchfield-162.patch`              | Reintroduces the #162 bug for the sanity job.                                                                                                                                                                                                                                   |
| CI               | `.github/workflows/android-storybook.yml`                          | Emulator capture/compare job + sanity job + jobs that commit regenerated baselines to a PR branch (PR auto-commit) or the dispatched branch (update mode) (below).                                                                                                              |

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
  logs `DSVR READY <nonce> <storyId>` (logcat). At boot it
  also logs its story index: `DSVR INDEX_BEGIN <count>`, one
  `DSVR INDEX_ITEM <storyId>` per story, `DSVR INDEX_END`.

The driver (`run.mjs`) force-stops and launches the app, reads the
index, then for each theme × story: sends the capture deep link,
waits for the READY line with the matching nonce, settles, and takes
`adb exec-out screencap -p`.

### Capture matrix

Default themes: `light_warmHarvest`, `light_quietDawn` — each
brand's LIGHT theme only (Stephen, 2026-10-24: dark captures
doubled the snapshot count for a second render of the same layout,
so dark was dropped from Android VR entirely). The
plain base themes are the web default for component stories and can
be added with `--themes light,dark,...`. Pages pin their brand theme
via story globals on web; in capture mode the driver's theme wins
(page stories render the brand the driver asks for — that is the
point of capturing them under their own brand).

How the driver's theme actually wins: page stories pin
`globals: { theme: "light_<brand>" }` in their CSF meta, and
Storybook composes the globals a decorator receives as
`{ ...userGlobals, ...storyGlobals }` — story globals spread last,
so the driver's `UPDATE_GLOBALS` alone cannot switch a page story
to dark (the first dark baselines were byte-identical light renders;
found reviewing PR #91). Capture mode therefore also hands the
deep link's theme to the preview decorator directly:
`apps/storybook/captureTheme.ts` holds the override, `App.tsx` sets
it from the capture link, and `.rnstorybook/preview.tsx` prefers it
over the theme global whenever it is set. Browse mode never sets it.

### Capture scope: pages only, own brand

Stephen's decision, 2026-10-23: the committed baseline set is **page
stories only, each under its own brand** — `pages-eciperay` under
Warm Harvest and `pages-memorize` under Quiet Dawn. Since
2026-10-24 the set is **light themes only**: dark captures doubled
the snapshot count (and the job's emulator time) without catching
layout regressions the light set misses, so the dark baselines were
deleted outright. With the current story set that is 32 + 18 =
**50 baselines**. Curating hundreds of component screenshots was
more review surface than the Android check needs; component stories
stay covered by Chromatic on web, and wrong-brand page captures are
excluded because pages pin their brand. The rule lives in the
`CAPTURE_SCOPE` table in `tools/visualRegression/run.mjs` — the
driver captures only in-scope (story, theme) pairs in both compare
and update modes, so the baseline folder and the CI runs follow the
table. Edit the table to change the scope.

Comparison: a pixel differs when any channel delta exceeds
`--threshold` (default 16/255); a screenshot fails when differing
pixels exceed `--max-ratio` (default 0.1%). Diff visualizations
(failed pixels in red over a dimmed baseline) are written to
`<out>/diff/`.

### Narrow-viewport variant: RecipesPage at phone display settings

Stephen's directive, 2026-10-24. The standard set captures at
`wm density 320` on the pixel_6's 1080px-wide screen — a **540dp
logical width**, where a page row's fixed-width children never
squeeze its flexible text. Eciperay #205 shipped exactly through
that gap: on Stephen's Pixel 8a (display-size override
`wm density 500` → **345.6dp logical width**, `font_scale 1.3`)
the RecipesPage row's thumbnail + Log cook/Delete buttons claimed
the whole row — the buttons grow with the font scale while the row
shrinks with the density — the `flex:1` title/subtitle block
starved to ~0dp, and each card stretched past the viewport with no
text at all. The fix (PR #117: row `flexWrap` + an explicit 60dp
`flexBasis` on the text block) passed this pipeline with **zero
baseline movement**, because at 540dp/font 1.0 the pre-fix and
post-fix renders are identical.

The variant closes that hole. In every mode, after the standard
pass, `ci/capture-compare.sh` switches the emulator display and
re-captures **only the RecipesPage stories** (Warm Harvest light —
the variant follows the light-only policy):

| Setting                          | Value       | Why                                                                  |
| -------------------------------- | ----------- | -------------------------------------------------------------------- |
| `wm size`                        | `1080x2400` | Pins the surface so the logical width below is profile-proof.        |
| `wm density`                     | `500`       | 1080px / (500/160) = **345.6dp logical width** — Stephen's override. |
| `settings put system font_scale` | `1.3`       | Stephen's font size; this is what inflates the row's buttons.        |

The standard display is restored after the pass, whatever its
outcome. Scope lives in the `NARROW_SCOPE` table in
`tools/visualRegression/run.mjs` (driver flag `--variant narrow`):
7 `pages-eciperay-recipespage` stories x light = **7
baselines** (57 total). RecipesPage only, deliberately — a second
full pass would roughly double the job's emulator time, and issue
#114 is cutting VR time, not growing it.

Baselines are named `<storyId>-narrow.png` in the same
`baselines/<theme>/` folders, so the variant flows through the
existing machinery unchanged: PR compare runs check both sets,
the luminance guard runs per set (each capture is judged against
its own baseline), the PR auto-commit flow regenerates and commits
both sets together, and a mode = `update` dispatch regenerates the
variant baselines in the same run as the standard ones — there is
no separate regeneration flow to learn.

Sensitivity proof (2026-10-24): with `RecipesPage` reverted to its
pre-#117 form on a scratch branch, the standard set compared
100/100 clean while the narrow set failed on 10 of 14 captures —
including all five content-bearing light captures (default 5.63%,
filtered 3.83%, filter-chooser-open 4.29%, with-filters-added
3.16%, expanded-accessory 0.98% of pixels differing), proving the
variant catches the #205 class in the light theme CI compares.
Run: https://github.com/spudly/design-system/actions/runs/40108956001

Determinism controls (CI script and recommended locally): fixed
emulator profile (pixel_6, API 34, google_apis x86_64), `wm density
320`, `font_scale 1.0` for the standard set (the narrow variant
pins its own surface — `wm size 1080x2400`, `wm density 500`,
`font_scale 1.3` — and restores the standard one afterwards),
display pinned awake at full brightness
(`svc power stayon`, manual `screen_brightness 255`, 30-minute
screen-off timeout — a doze-dimmed display otherwise leaks into
screencap and, in update mode, into committed baselines),
animations disabled, SwiftShader GPU (same
rasterizer locally and in CI only if your machine also uses software
rendering — baselines are generated BY the CI job, so they are
self-consistent; do not commit baselines captured on a physical
device).

## Baselines: generating and updating

Baselines are created by the CI job, never by hand-editing images.
On a pull request the whole cycle is automatic (Stephen's
directive, 2026-10-23 — no manual dispatch):

1. **PRs: automatic.** The PR compare run (`capture-compare.sh`,
   mode `pr-autocommit`) starts with the ordinary strict compare
   of both capture sets (standard + narrow variant). If every
   story matches, nothing else happens. If the compare
   fails and **every failure is a pixel diff** (a capture failure —
   deep link, READY timeout, screencap — means an incomplete set
   and stops the flow), the job regenerates the baselines from the
   fresh captures, runs them through the **luminance guard**
   (below), and then **captures everything a second time and
   compares against the regenerated set, in the same job**. Only a
   set that passes that in-job re-compare is committed: the
   `commit-pr-baselines` job syncs it into
   `tools/visualRegression/baselines/` and pushes it to the PR's
   head branch as github-actions[bot] ("chore(vr): update Android
   Storybook baselines"). Review the baseline PNGs in the PR diff
   like any other change — a green VR check on a PR whose head
   carries such a bot commit means "the change is real and its
   baselines were re-verified", not "nothing changed". The diff
   images from the first compare pass are in the `dsvr-output`
   artifact.
2. **First run / new stories**: the compare job passes with `WARN …
no baseline yet` lines and a BOOTSTRAP note while baselines are
   missing — capture still runs, so a story that crashes the app
   fails the job even before it has a baseline.
3. **Regenerate deliberately**: dispatch the workflow
   (Actions → "Android Storybook VR" → Run workflow) with
   mode = `update`, **from the PR branch**. It captures everything
   in the capture scope (page stories, own brand — see "Capture
   scope" above) plus the narrow-viewport variant set, and does
   not compare. The follow-on
   `commit-baselines` job then syncs the fresh screenshots into
   `tools/visualRegression/baselines/` and — only if something
   actually changed — commits them to the dispatched branch as
   github-actions[bot] ("chore(vr): update Android Storybook
   baselines") and pushes. The regenerated baselines therefore show
   up in the PR diff for review like any other change; nobody has
   to download and commit them by hand. (The fresh screenshots are
   still uploaded as the `dsvr-baselines` artifact, as a
   fallback/debug copy.) This manual path remains for cases the PR
   flow refuses (a guard trip, a capture failure) or when there is
   no failing PR compare to trigger from; it does not run the
   luminance guard, so review its baseline diff with the #101
   dimming signature in mind.
4. Dispatching mode = `update` from the default branch (`main`) is
   refused: the commit job fails with an error, because baselines
   must land via a PR branch so they are reviewed in a diff. The PR
   auto-commit jobs refuse the default branch the same way — main
   pushes are always compare-only and never receive baseline
   commits.
5. A baseline commit's push does not auto-run the PR's checks:
   GitHub parks workflow runs for bot-token pushes as
   "action_required", so a maintainer approves the follow-up run in
   the Actions UI (or pushes to the branch). For the PR flow that
   parked run is not a blocker — the in-job re-compare already
   verified the committed set — and when it does run, the job's
   bot-head detection (head commit authored by github-actions[bot]
   with the auto-commit message and baseline files only) passes it
   immediately without re-capturing, so the bot never commits twice
   for the same change.

Locally (with an emulator): `node tools/visualRegression/run.mjs --update`.

### The luminance guard (issue #101 mitigation)

Issue #101: the capture pipeline intermittently screenshots a
dimmed emulator display (every story uniformly darkened to ~40%
brightness) despite the display pin in the CI script. A compare run
in that state only fails loudly, but the PR auto-commit path turns
captures into baselines — a dimmed set committed as baselines would
poison every future compare. `tools/visualRegression/guard.mjs`
therefore gates the automatic path. Over the fresh captures it
rejects the whole set when:

- any capture's mean luminance is outside [0.60, 1.67] of its own
  previous baseline's mean (dimming is multiplicative, ≈0.4x; a
  legit page change moves a full-page mean by a few percent),
- the session's median ratio is outside [0.80, 1.25] (the flake
  dims everything at once), or
- a capture is a near-uniform frame (blank surface or a system
  scrim over the app — a real page screenshot always has variance).

On any trip the job commits nothing and fails, naming the guard and
issue #101. There is no absolute luminance floor: dark-theme pages
are legitimately dark, so only the ratio against a story's own
baseline is a safe signal. The guard is a mitigation, **not** a fix
for #101 — the root cause of the dimming is still open there; the
guard only guarantees a dimmed or scrimmed capture set can never
become baselines via the automatic path.

## The #162 sanity check

Acceptance requires proof the pipeline catches the bug class it
exists for. `tools/visualRegression/sanity/searchfield-162.patch`
reintroduces the bug into `src/components/SearchField.tsx`: the drawn
shapes glyph becomes the pre-fix text glyph with a numeric
`lineHeight` equal to its `fontSize` (the exact pattern
`test/glyphLineHeight.test.mjs` bans in committed source), and the
post-#162 clip-box hardening (`height: 44; overflow: hidden` on the
glyph box) is removed. On web this renders identically (a web line
box honors lineHeight exactly); on Android the text glyph's line box
mis-measures and stretches the field — the asymmetry that shipped
#162.

The `sanity` CI job: captures the SearchField stories clean, applies
the patch, rebuilds and reinstalls, recaptures, and compares the two
captures. **The job succeeds only if the comparison FAILS.** Run it
by dispatching the workflow with mode = `sanity`, or by adding the
`android-sanity` label to a PR. If SearchField changes so the patch
no longer applies, the job fails at `git apply` — refresh the patch
(edit the file the same way, `git diff` it into the patch file,
revert) in the same PR.

## CI scoping

The workflow is path-filtered to `src/**`, `apps/storybook/**`,
`tools/visualRegression/**` and itself, because Actions minutes are
on paid overage until 2026-11-01 and an emulator job is the most
expensive kind. It builds a **release** APK with the JS bundle
embedded (the generated template signs it with the debug keystore,
so it installs as-is). Serving the bundle from a Metro dev server
inside the job was tried first and failed on the emulator with
React Native's "Unable to load script" error — the debug app could
not reach Metro through the adb reverse tunnel, so JS never
executed; an embedded bundle removes the network from the capture
entirely. (Local development still uses Metro via `expo start` —
only the CI scripts build release.)
