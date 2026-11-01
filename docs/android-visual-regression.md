# Android visual regression (React Native storybook)

Issue #43. The react (web) Storybook is gated by Chromatic; this
system is the react-native storybook's counterpart: the **same CSF
stories** rendered in a real Android app and screenshot-compared in
CI. (The two-storybook structure is described in
[storybooks.md](storybooks.md).) It exists because the
class of bug it catches — React Native measuring/rendering text
differently than the web — is invisible to web screenshots:
spudly/eciperay#162 (the SearchField glyph whose line box stretched
the field to 1826px on a Pixel 8a) passed every web check.

## Pieces

| Piece            | Where                                                              | What it does                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host app         | `apps/storybook/`                                                  | Expo (SDK 58) app mounting @storybook/react-native v10 with the repo's stories. Also the capture target for the VR driver.                                                                                                                                                       |
| On-device config | `src/tamagui.config.ts` → `createOnDeviceStorybookTamaguiConfig()` | Combined three-brand config (base, Warm Harvest, Quiet Dawn) with native font registrations. The web combined config uses CSS-variable font stacks, invalid on native. One process-wide config either way — Tamagui cannot swap brand configs at runtime (spudly/eciperay#149).  |
| Preview          | `apps/storybook/.rnstorybook/preview.tsx`                          | Mirrors the web preview: a `theme` global (the six sub-theme names, e.g. `light_warmHarvest`, `dark_quietDawn`) drives `defaultTheme`, keyed remount per theme.                                                                                                                  |
| VR driver        | `tools/visualRegression/run.mjs`                                   | Drives the app over ADB, captures screenshots, pixel-compares against baselines. Zero dependencies (own PNG codec in `png.mjs`, validated round-trip against PIL).                                                                                                               |
| Capture module   | `apps/storybook/modules/dsvr-capture/`                             | Local Expo native module (issue #137): draws the story's full content — below the fold included — into a PNG on a software canvas, which the driver pulls over ADB instead of screenshotting the display surface (see "Full-page captures" below).                               |
| Luminance guard  | `tools/visualRegression/guard.mjs`                                 | Pre-commit check on fresh captures: rejects a set that looks uniformly dimmed or scrimmed (issue #101) before CI may turn it into baselines (below).                                                                                                                             |
| Commit gate      | `tools/visualRegression/commitGate.mjs`                            | Pixel-diff gate on the commit step (issue #296): a fresh capture replaces its baseline only when its differing-pixel ratio exceeds `COMMIT_GATE_MAX_RATIO` (1%), so render/re-encode noise never lands as baseline churn. Used by the PR auto-commit staging and by update mode. |
| Baselines        | `tools/visualRegression/baselines/<theme>/<storyId>.png`           | Committed reference screenshots. The narrow-viewport variant's baselines sit in the same folders with a `-narrow` filename suffix.                                                                                                                                               |
| Sanity patch     | `tools/visualRegression/sanity/searchfield-162.patch`              | Reintroduces the #162 bug for the sanity job.                                                                                                                                                                                                                                    |
| CI               | `.github/workflows/android-storybook.yml`                          | Emulator capture/compare job + sanity job + jobs that commit regenerated baselines to a PR branch (PR auto-commit) or the dispatched branch (update mode) (below).                                                                                                               |

Fonts: the app loads the same faces the apps register — the UiSans
family (four static per-weight faces instanced from Raleway and
renamed per its OFL Reserved Font Name; Regular/Medium/SemiBold/Bold
TTFs, all
themes' body/heading; static faces since #326 — the variable TTF's
medium weight resolved nondeterministically on Android) and Alegreya
(variable TTF, Quiet Dawn verse) — from
`apps/storybook/assets/fonts/` (OFL license files alongside). The
config resolves them per platform via the tokens' native family and
face names, exactly as the apps do.

Known deviation: config fonts are global, so the on-device combined
config takes its verse font from Memorize's family — base/Warm
Harvest verse-role text renders Alegreya on device instead of the
generic serif. Stories-only, and no Warm Harvest surface ships verse
text. Web keeps the per-brand stacks.

## Stories on device

Stories are shared verbatim with the react storybook: `apps/storybook/.rnstorybook/main.ts`
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
index (one relaunch if the index never arrives — an emulator
app-process death at boot must not fail the whole run, issue #352),
then for each theme × story: sends the capture deep link,
waits for the READY line with the matching nonce, settles, and
captures the frame. By default the frame is **app-drawn**: the deep
link carries `&appcapture=1`, the app draws the story's full
content via the dsvr-capture module and logs a `DSVR APPCAP
<nonce> <storyId> …` line, and the driver pulls that PNG over ADB
(`tools/visualRegression/appCapture.mjs`). `--no-app-capture`
restores the legacy path — one `adb exec-out screencap -p` of the
display surface — for debugging only.

### Full-page captures (issue #137)

A screencap can only ever show the first viewport of a page: the
display pipeline never renders taller than the physical surface
(a spike that pinned `wm size 1080x8000` got the 2400px render
tiled, never extended), so below-the-fold content — the servings
stepper and scale chips on RecipeDetailPage, for instance — was
never verified by this pipeline. Captures are therefore drawn by
the app itself:

- The native module finds the story's ScrollView, measures its
  content child's true height (RecipeDetailPage's longest fixture
  measures 5,525px — 2.3x the surface), temporarily re-lays out
  the ancestor chain at that full height, and draws the hierarchy
  into a bitmap-backed software canvas. Height is memory-bound,
  not surface-bound; layout geometry is identical to the
  on-screen render (the spike verified alignment is exact).
- **Truncation guard**: the module reports the measured content
  height alongside the drawn frame, and the driver rejects the
  capture unless the geometry checks out exactly — for content
  taller than the viewport, the frame's content region (drawn
  height minus the on-screen chrome) must equal the measured
  content height; for content that fits the viewport, the frame
  must be the root's full natural height (a shorter bitmap would
  clip the root's lower rows and any content sitting in them).
  A rejected capture fails the run and commits nothing.
- **Blank-tail crop** (`tools/visualRegression/crop.mjs`): the
  drawn frame still carries the root's below-viewport region
  under the content; the driver trims trailing uniform rows so a
  baseline ends at the page's real last row. A scroll capture
  that trims nothing while ending on a non-uniform row is
  truncation-suspect and fails loudly — the safety net behind the
  guard.
- **No-ScrollView fallback**: a story with no ScrollView worth
  unrolling (the RecipeDetailPage `loading` state is a centered
  spinner behind an early return; an empty virtualized list —
  VerseSearchPage with no results — measures zero content height
  inside its fixed shell) is single-viewport by construction.
  The module draws the root hierarchy at its natural height and
  reports `mode=root`; the driver logs an explicit `DSVR APPCAP
FALLBACK` line. There is no silent fallback to screencap for
  scrollable stories — an app-capture failure fails the capture.
- **Renderer change**: frames are rasterized by the software
  canvas, not the display compositor. Shadow and anti-aliasing
  rasterization differ slightly (the spike measured a 0.17–0.46%
  first-viewport delta against the old screencap baselines, all
  of it in hero-image/card-shadow rows — geometry identical).
  Because comparisons are like-vs-like, this cost exactly one
  full baseline regeneration when #137 landed; every baseline in
  the tree is now an app-drawn frame.
- **FlatList caveat**: pages rendered with a virtualized list
  only mount the rows near the viewport (React Native's default
  `initialNumToRender` is 10), and unrendered rows exist only as
  height spacers — an app-drawn frame of a >10-row list fixture
  would contain blank gaps where the unmounted rows belong. All
  current fixtures are ≤7 items, so today's captures are
  complete. **Before adding a list fixture with more than 10
  rows**, the page needs a capture-facing full-render prop (e.g.
  `fullRender` → `disableVirtualization`) threaded from the
  story; do not just raise the fixture size and trust the frame.

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
deleted outright. With the current story set that is 121 + 22 =
**143 baselines**. Curating hundreds of component screenshots was
more review surface than the Android check needs; component stories
stay covered by Chromatic on web, and wrong-brand page captures are
excluded because pages pin their brand. The rule lives in the
`CAPTURE_SCOPE` table in `tools/visualRegression/run.mjs` — the
driver captures only in-scope (story, theme) pairs in both compare
and update modes, so the baseline folder and the CI runs follow the
table. Edit the table to change the scope.

### Coverage listing (issue #128)

Every page in @spudly/ui, accounted for against the committed
baselines. One row per story group (a page's stories, or an
aggregate story file); `PageFrame` is the internal page shell —
it has no stories of its own and renders inside every page
capture below. The narrow-variant row is the RecipesPage
exception set (see the next section). This table is pinned by
`test/visualRegressionScope.test.mjs` against the derived
capture set and the baseline files on disk: a page story without
a committed baseline — or a row that drifts from the files —
fails the test suite. The table itself is generated by
`tools/visualRegression/coverageListing.mjs` (run it to refresh
by hand); the baseline auto-commit jobs run it and stage this
file in the same bot commit as the baselines, so the listing
refreshes itself when baselines land (issue #284).

<!-- VR-COVERAGE-BEGIN -->

| Story group                                 | Theme             | Stories | Baselines |
| ------------------------------------------- | ----------------- | ------: | --------: |
| pages-eciperay                              | light_warmHarvest |       2 |         2 |
| pages-eciperay-addrecipemenupage            | light_warmHarvest |       1 |         1 |
| pages-eciperay-aisessionpage                | light_warmHarvest |       3 |         3 |
| pages-eciperay-discoverpage                 | light_warmHarvest |       8 |         8 |
| pages-eciperay-editrecipepage               | light_warmHarvest |       1 |         1 |
| pages-eciperay-editversionpage              | light_warmHarvest |       2 |         2 |
| pages-eciperay-feedbackpage                 | light_warmHarvest |       2 |         2 |
| pages-eciperay-forgotpasswordpage           | light_warmHarvest |       2 |         2 |
| pages-eciperay-homepage                     | light_warmHarvest |       3 |         3 |
| pages-eciperay-importimagepage              | light_warmHarvest |       1 |         1 |
| pages-eciperay-importreviewpage             | light_warmHarvest |       2 |         2 |
| pages-eciperay-importtextpage               | light_warmHarvest |       2 |         2 |
| pages-eciperay-importurlpage                | light_warmHarvest |       2 |         2 |
| pages-eciperay-landingpage                  | light_warmHarvest |       2 |         2 |
| pages-eciperay-legaldocumentpage            | light_warmHarvest |       3 |         3 |
| pages-eciperay-manualentrypage              | light_warmHarvest |       1 |         1 |
| pages-eciperay-mealcookingmodepage          | light_warmHarvest |       5 |         4 |
| pages-eciperay-mealdetailpage               | light_warmHarvest |       2 |         2 |
| pages-eciperay-mealformpage                 | light_warmHarvest |       3 |         3 |
| pages-eciperay-mealplandetailpage           | light_warmHarvest |       5 |         5 |
| pages-eciperay-mealplanformpage             | light_warmHarvest |       2 |         2 |
| pages-eciperay-mealplanspage                | light_warmHarvest |       4 |         4 |
| pages-eciperay-mealshubpage                 | light_warmHarvest |       3 |         3 |
| pages-eciperay-profilepage                  | light_warmHarvest |       1 |         1 |
| pages-eciperay-publicpageframe              | light_warmHarvest |       3 |         3 |
| pages-eciperay-publicrecipepage             | light_warmHarvest |       8 |         8 |
| pages-eciperay-recipedetailpage             | light_warmHarvest |       9 |         9 |
| pages-eciperay-recipeformpage               | light_warmHarvest |       4 |         4 |
| pages-eciperay-recipespage                  | light_warmHarvest |      12 |        12 |
| pages-eciperay-recipespage — narrow variant | light_warmHarvest |      12 |        12 |
| pages-eciperay-resetpasswordpage            | light_warmHarvest |       2 |         2 |
| pages-eciperay-shoppinglistpage             | light_warmHarvest |       3 |         3 |
| pages-eciperay-signinpage                   | light_warmHarvest |       3 |         3 |
| pages-eciperay-signuppage                   | light_warmHarvest |       3 |         3 |
| pages-eciperay-tagspage                     | light_warmHarvest |       3 |         3 |
| pages-memorize                              | light_quietDawn   |       4 |         4 |
| pages-memorize-memorizationsessionpage      | light_quietDawn   |       5 |         5 |
| pages-memorize-memorizereviewpage           | light_quietDawn   |       2 |         2 |
| pages-memorize-memorizesettingspage         | light_quietDawn   |       3 |         3 |
| pages-memorize-myversespage                 | light_quietDawn   |       2 |         2 |
| pages-memorize-versesearchpage              | light_quietDawn   |       6 |         6 |
| **Total**                                   |                   | **146** |   **145** |

<!-- VR-COVERAGE-END -->

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
12 `pages-eciperay-recipespage` stories x light = **12
baselines** (143 total). RecipesPage only, deliberately — a second
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

The variant uses the same app-drawn capture mechanism (#137): the
narrow display settings change the layout the app measures and
draws (345.6dp logical width, font_scale 1.3), not how the frame
is produced. RecipesPage is a FlatList page; its fixture has 7
rows, under the 10-row virtualization caveat above.

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
screen-off timeout — a doze-dimmed display leaks into the legacy
screencap path and failure-evidence screenshots; app-drawn frames
never touch the surface),
animations disabled, SwiftShader GPU. App-drawn frames rasterize
on Android's software canvas regardless of the GPU path, and
baselines are generated BY the CI job, so they are
self-consistent; do not commit baselines captured on a physical
device.

## Baselines: generating and updating

Baselines are created by the CI job, never by hand-editing images.
On a pull request the whole cycle is automatic (Stephen's
directive, 2026-10-23 — no manual dispatch):

1. **PRs: automatic.** The PR compare run (`capture-compare.sh`,
   mode `pr-autocommit`) starts with the ordinary strict compare
   of both capture sets (standard + narrow variant). If every
   story matches and every story has a baseline, nothing else
   happens. If the compare
   fails and **every failure is a pixel diff** (a capture failure —
   deep link, READY timeout, app-capture error or guard rejection —
   means an incomplete set
   and stops the flow) — or if any captured story has **no
   baseline yet** (point 2) — the job regenerates the baselines from the
   fresh captures, runs them through the **luminance guard**
   (below), and then **captures everything a second time and
   compares against the regenerated set, in the same job**. The
   regenerated set is built by the **pixel-diff commit gate**
   (issue #296, `commitGate.mjs`): each fresh capture is
   pixel-diffed against its committed baseline and staged only
   when more than `COMMIT_GATE_MAX_RATIO` (1%) of its pixels
   differ — captures at or under the gate keep their baseline
   bytes, so render/re-encode noise never lands in the bot
   commit. (Replaying the PR #295 bot commit that motivated the
   gate through it: 24 of its 50 rewritten files are skipped as
   noise — a systematic band at ≤0.47% plus one page the change
   did not touch at 0.747% — and the 26 staged are 25 page-height
   changes plus one genuine change at 1.025%; a capture whose
   dimensions changed always stages.) The in-job re-compare
   proves the staged set at the same gate tolerance, the gate
   logs every SKIP/STAGE decision and a per-run summary in the
   job log, and when the gate stages **zero** files the run
   publishes nothing — no baseline commit at all. Only a
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
2. **First run / new stories**: a missing baseline never fails a
   compare — the driver captures the story, warns `WARN … no
baseline yet` and skips it (a BOOTSTRAP note when nothing at all
   was compared), so a story that crashes the app still fails the
   job before it has a baseline. On a PR that bootstrap state is
   not terminal: it triggers the same guarded regeneration as a
   pixel diff (point 1), so the new story's baseline is committed
   to the PR branch by the auto-commit flow. (Before issue #128
   it did not — regeneration was entered only on a failed compare,
   so the B3a–B4 page stories bootstrap-passed with no baselines
   ever landing. Compare-only runs — main pushes, dispatched
   compares — still just warn.)
3. **Regenerate deliberately**: dispatch the workflow
   (Actions → "React Native storybook VR" → Run workflow) with
   mode = `update`, **from the PR branch**. It captures everything
   in the capture scope (page stories, own brand — see "Capture
   scope" above) plus the narrow-viewport variant set, and does
   not compare. Writes go through the same commit gate as the PR
   flow (issue #296): a capture at or under the gate keeps its
   existing baseline (the driver logs `SKIP …` lines and counts
   them in its summary), so a dispatched update no longer
   rewrites noise-only files either. To force a sub-gate change
   into the baselines deliberately, lower the gate for the run
   (`--commit-max-ratio` on `run.mjs`, or the
   `DSVR_COMMIT_MAX_RATIO` env var) — local runs only: the
   Actions dispatch accepts no gate override, so dispatched
   updates always use the default gate. The follow-on
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

Since #137, captures are app-drawn frames that never touch the
display surface, so the #101 dimming path cannot contaminate them
at all (the display pin stays for the legacy screencap path and
failure-evidence screenshots). The guard still gates the automatic
path unchanged: its near-uniform check is what catches a blank or
broken draw, and its ratio checks keep policing any future
capture-path change.

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
`tools/visualRegression/**` and itself, so the emulator job does
not run on changes that cannot affect a story screenshot. It
builds a **release** APK with the JS bundle embedded (the
generated template signs it with the debug keystore, so it
installs as-is). Serving the bundle from a Metro dev server
inside the job was tried first and failed on the emulator with
React Native's "Unable to load script" error — the debug app
could not reach Metro through the adb reverse tunnel, so JS
never executed; an embedded bundle removes the network from the
capture entirely. (Local development still uses Metro via
`expo start` — only the CI scripts build release.)

### Scoped PR runs: capture only the affected stories (issue #114)

Even path-filtered, a full run captures all 115 baselines (104
standard + 11 narrow) — a 20–30 minute emulator job gating every
PR, including one-line component fixes. Since issue #114, a PR
compare run first computes the stories the PR can actually
affect and captures only those:

- The workflow's **Compute VR capture scope** step lists the PR's
  changed files and runs `tools/visualRegression/scope.mjs`,
  which writes a decision JSON to `/tmp/dsvr-scope.json`.
- `scope.mjs` derives every story id in `src/` from the CSF
  files (Storybook's own title/export → id rules) and builds the
  component import graph over `src/`. A changed file affects
  every story whose transitive import closure contains it — page
  stories and the widget stories alike; a changed story file
  affects itself. All variants of an affected story are captured
  (standard, plus narrow for RecipesPage).
- `ci/capture-compare.sh` passes the decision to the driver
  (`run.mjs --scope-file`), which restricts captures to the
  listed ids. The drawn==measured and truncation guards behave
  exactly as in a full run. In the PR auto-commit flow, a scoped
  run regenerates, luminance-guards, and commits **only its
  scoped set** — baselines outside the scope are never read for
  writing and never committed (a set scoped to zero stories skips
  its luminance guard, which has nothing to judge).
- Sanity mode always runs its full flow. `workflow_dispatch`
  compare/update runs default to the full set; a dispatch
  compare can opt into scoping with the `scope: auto` input
  (diffs the branch against the default branch). Update mode
  always captures the full set — it exists to regenerate
  baselines.

**Full-run fallback — never silently reduce coverage.** The
decision is the full 110 whenever any changed file is:

- design tokens (`src/tokens/**`), themes (`src/themes/**`), or
  the Tamagui config (`src/tamagui.config.ts`) — they feed every
  render;
- the capture/compare harness itself: `tools/visualRegression/**`,
  `apps/storybook/**` (host app + the native capture module),
  `.github/workflows/**`, `.storybook/**`;
- package manifests/lockfiles (`package.json`,
  `package-lock.json`) or build config (`tsconfig*.json`,
  `babel.config.*`, `metro.config.*`, `vite.config.*`);
- a `src/` file that no longer exists in the tree (deleted by
  the PR — it cannot be mapped through the post-change graph);
- or whenever the mapping cannot be computed confidently at all
  (an unparseable story file, a failed changed-file listing, a
  crashed scope step).

**Forcing a full run on a PR:** add the **`vr-full-run`** label.
The scope step reads it and forces the full set; the decision and
its reasons are echoed into the job's step summary on every run,
so what was captured (and why) is always auditable after the
fact. The mapper itself is unit-tested in
`test/visualRegressionScope.test.mjs`, including an invariant
that pins the derived story inventory against the committed
baselines.

### Emulator AVD cache (issue #114)

Every run used to create the AVD and pay Android first-boot
setup before the first capture. Both emulator jobs now restore
`~/.android/avd` from `actions/cache`:

- **Key:**
  `avd-34-google_apis-x86_64-pixel_6-<hash>` where the hash
  covers `.github/workflows/android-storybook.yml` and
  `tools/visualRegression/ci/capture-compare.sh`. The literal
  prefix spells out the emulator configuration (API level,
  system-image target, architecture, device profile); the hash
  covers everything else the runs pin, including the display
  setup in the capture script. Changing any of those misses the
  cache and regenerates it — that is the invalidation story.
- On a cache miss (or a restored cache whose `test.avd` is
  absent), a **Generate AVD snapshot for caching** step creates
  and first-boots the AVD and the cache saves it at job end; the
  capture steps run with `force-avd-creation: false` so they
  reuse it. A corrupt or stale entry therefore degrades to a
  cold boot in the generation step, never to a failed or wrong
  run. If a cached AVD ever misbehaves persistently, bump the
  `avd-` key prefix to invalidate every entry at once.
- **Cache scoping (actions/cache semantics):** an entry is
  visible to runs on the ref that created it, to PRs whose base
  is that ref, and to everything once a run on the default
  branch has saved one. In practice: repeat pushes to the same
  PR hit the entry its first run saved (~1.5 min of AVD
  generation skipped), a `workflow_dispatch` run on the default
  branch warms the cache for every later PR, and a brand-new
  PR's first run may still generate — the cost is one generation
  step, not a failure.
