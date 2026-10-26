# Baselines

Reference screenshots for the Android visual-regression driver, one
per theme + story: `<theme>/<storyId>.png`.

Scope (Stephen, 2026-10-23; light-only since 2026-10-24): page
stories only, each in its own brand's LIGHT theme —
`pages-eciperay` under light_warmHarvest, `pages-memorize` under
light_quietDawn, plus the narrow-viewport RecipesPage variant
(107 baselines total). Dark themes were dropped because they
doubled the snapshot count. The enforcing rule is the
`CAPTURE_SCOPE` / `NARROW_SCOPE` tables in `../run.mjs`; see
`docs/android-visual-regression.md` ("Capture scope").

This directory intentionally starts EMPTY (bootstrap state): with no
baselines present the driver captures everything, warns per story,
and compares nothing. Generate the real baselines by dispatching the
"React Native storybook VR" workflow with mode = `update`, downloading
the `dsvr-baselines` artifact, and committing its contents here.
See docs/android-visual-regression.md ("Baselines: generating and
updating") — never hand-edit or hand-create images in this folder.
