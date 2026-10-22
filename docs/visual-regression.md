# Visual regression (Playwright)

Screenshot regression for every Storybook story, in both brand themes —
Eciperay **"Warm Harvest"** and Memorize **"Quiet Dawn"** (light mode) —
using [Playwright](https://playwright.dev/) against the built Storybook.
Implemented for issue #42.

## How it works

- `visual/storybook.spec.ts` enumerates stories from the built
  Storybook's `storybook-static/index.json` — never a hand-maintained
  list — so a new story gets coverage automatically, and each story is
  screenshotted once per theme via the Storybook `theme` global
  (`.storybook/preview.tsx`).
- The screenshot target is the `#storybook-root` element, not the
  viewport: a layout blow-up like the SearchField `lineHeight` bug
  (eciperay#162) grows the root, and a viewport shot would crop it away.
- External images referenced by stories (Avatar's picsum.photos image)
  are stubbed with a deterministic PNG; animations are disabled and
  carets hidden so animated components (Spinner, Toast) screenshot a
  stable frame.
- Baselines are committed in-repo under
  `visual/storybook.spec.ts-snapshots/` (Chromium only, first pass).
- CI (`.github/workflows/visual.yml`) runs the suite on PRs that touch
  `src/`, `.storybook/`, `visual/`, `playwright.config.ts`, or the
  package manifests. A visual diff **fails the PR**; the actual /
  expected / diff images are uploaded as the `visual-diffs` artifact.

## Running locally

```sh
npm ci
npx playwright install chromium   # once per machine / Playwright upgrade
npm run build-storybook
npm run test:visual
```

## Updating baselines (a deliberate visual change)

1. Make the change and rebuild Storybook: `npm run build-storybook`.
2. Regenerate: `npm run test:visual:update`.
3. Review every changed PNG (they are ordinary files in
   `visual/storybook.spec.ts-snapshots/` — check the diff in your PR
   like any other change) and commit them **in the same PR** as the
   change that caused them.
4. CI then passes with the new baselines; reviewers see the visual
   change as changed PNGs in the PR diff.

If a PR fails the visual job and the change was _not_ deliberate, that
is the suite doing its job — fix the rendering regression instead of
updating baselines.

**Platform note:** baselines are generated on Linux with the repo's
pinned Playwright/Chromium. System-font fallback differs on macOS and
Windows, so screenshots taken there will not match. If you cannot run
Linux locally, use CI to regenerate: run the **visual** workflow
manually (`workflow_dispatch`) with **update_baselines = true**, download
the `visual-baselines` artifact, and commit its PNGs.

## Playwright vs Chromatic — verdict: this replaces Chromatic

Chromatic (`.github/workflows/chromatic.yml`, now removed) snapshotted
the same Storybook stories, but:

- it needs an external service, a project token secret, and a manual
  "accept changes" step in Chromatic's UI — the gate lives outside the
  repo and outside the PR diff;
- its baselines are not in-repo, so a visual change cannot be reviewed
  as files in the PR that caused it;
- it does not add coverage: the story × theme matrix is identical.

Playwright covers the same stories and themes, fails the PR directly,
keeps baselines reviewable in-repo, and runs identically locally and in
CI with no secret. That is strictly the better fit for a two-app design
system maintained by a small team, so Chromatic is **replaced**, not
complemented — running both would double snapshot cost and give two
sources of truth for the same pixels. Chromatic's one real advantage,
a hosted browsable build URL per PR, is a review convenience rather
than regression coverage; if it is ever missed, re-adding the workflow
is a one-file change.
