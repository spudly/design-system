# Baselines

Reference screenshots for the Android visual-regression driver, one
per theme + story: `<theme>/<storyId>.png`.

This directory intentionally starts EMPTY (bootstrap state): with no
baselines present the driver captures everything, warns per story,
and compares nothing. Generate the real baselines by dispatching the
"Android Storybook VR" workflow with mode = `update`, downloading
the `dsvr-baselines` artifact, and committing its contents here.
See docs/android-visual-regression.md ("Baselines: generating and
updating") — never hand-edit or hand-create images in this folder.
