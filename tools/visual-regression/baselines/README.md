# Baselines

Reference screenshots for the Android visual-regression driver, one
per theme + story: `<theme>/<storyId>.png`.

Scope (Stephen, 2026-10-23): page stories only, each in its own
brand — `pages-eciperay` under the two warmHarvest themes,
`pages-memorize` under the two quietDawn themes (96 baselines). The
enforcing rule is the `CAPTURE_SCOPE` table in `../run.mjs`; see
`docs/android-visual-regression.md` ("Capture scope").

This directory intentionally starts EMPTY (bootstrap state): with no
baselines present the driver captures everything, warns per story,
and compares nothing. Generate the real baselines by dispatching the
"Android Storybook VR" workflow with mode = `update`, downloading
the `dsvr-baselines` artifact, and committing its contents here.
See docs/android-visual-regression.md ("Baselines: generating and
updating") — never hand-edit or hand-create images in this folder.
