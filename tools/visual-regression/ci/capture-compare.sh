#!/usr/bin/env bash
# CI capture driver for the Android Storybook visual-regression job.
#
# Invoked from .github/workflows/android-storybook.yml as a SINGLE
# script line: reactivecircus/android-emulator-runner executes each
# line of its `script:` input in a separate `sh -c` process, so a
# multi-line workflow script cannot keep state (a `cd` on one line
# does not affect the next) — the whole flow lives in this file
# instead, where it is also reviewable and runnable by hand on any
# machine with an emulator running.
#
# The app is built as a RELEASE APK with the JS bundle embedded.
# Serving the bundle from Metro inside CI was tried first and failed
# on the emulator with React Native's "Unable to load script" error
# (the debug app could not reach the dev server through the adb
# reverse tunnel / emulator host aliasing, so JS never executed) —
# an embedded bundle removes the network from the capture entirely.
# The generated template signs release builds with the debug
# keystore, so the APK installs as-is.
#
# Usage: capture-compare.sh [compare|update|pr-autocommit]
#
# Modes compare/update are the workflow_dispatch modes. Mode
# pr-autocommit is what pull_request runs use (Stephen's directive,
# 2026-10-23): if the compare finds screenshot diffs, regenerate the
# baselines from the fresh captures IN THIS JOB — gated by the
# luminance guard (tools/visual-regression/guard.mjs, issue #101)
# and an in-job re-capture/re-compare against the regenerated set —
# and hand the proven-green set to the workflow's
# commit-pr-baselines job, which pushes it onto the PR branch.
# Anything short of proven green (capture failures, a guard trip, a
# failed re-compare) commits NOTHING and fails the job.
set -euo pipefail

MODE="${1:-compare}"
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT/apps/storybook"

npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease --console=plain -q)
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Deterministic capture surface: fixed density + font scale.
adb shell wm density 320
adb shell settings put system font_scale 1.0

# Pin the display fully awake and bright for the whole session.
# The release build above can take long enough for the emulator's
# screen to time out and doze-dim, and screencap reads the dimmed
# surface: an update dispatch on 2026-10-23 (PR #97) captured every
# story uniformly dimmed to ~40% brightness and would have
# committed those as baselines. Compare runs only fail loudly in
# that state; update runs must never capture it at all.
adb shell svc power stayon true
adb shell settings put system screen_brightness_mode 0
adb shell settings put system screen_brightness 255
adb shell settings put system screen_off_timeout 1800000
adb shell input keyevent KEYCODE_WAKEUP

# Generous logcat buffer: the driver reads the full log back.
adb logcat -G 8M

# PR auto-commit flow. Runs entirely inside this job; the workflow's
# commit-pr-baselines job only pushes what this flow stages.
pr_autocommit() {
  local tool_dir="$REPO_ROOT/tools/visual-regression"
  local out=/tmp/dsvr-out
  local staged=/tmp/dsvr-staged-baselines

  # Pass 1: the ordinary strict compare against committed baselines.
  echo "PR auto-commit: compare pass against committed baselines..."
  if node "$tool_dir/run.mjs" --out "$out"; then
    echo "PR auto-commit: no diffs - baselines already match; nothing to commit."
    return 0
  fi

  # Only a run whose failures are ALL pixel diffs may regenerate.
  # A capture failure (deep link, READY timeout, screencap) means
  # the fresh set is incomplete, and an incomplete set must never
  # become the baselines.
  local classify
  classify="$(node -e '
    const fs = require("node:fs");
    let s;
    try { s = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); }
    catch { console.log("unreadable"); process.exit(0); }
    const failed = Array.isArray(s.failed) ? s.failed : [];
    if (failed.length === 0) { console.log("none"); process.exit(0); }
    const diff = /: \d+\.\d+% pixels differ/;
    console.log(failed.every((f) => diff.test(f)) ? "diffs-only" : "other");
  ' "$out/summary.json")"
  if [ "$classify" != "diffs-only" ]; then
    echo "::error::PR auto-commit: compare failed with non-diff failures (classification: $classify); NOT regenerating baselines. See the compare output above."
    return 1
  fi
  echo "PR auto-commit: compare found only pixel diffs; regenerating baselines from the fresh captures."

  # The regenerated set: committed baselines overlaid with the fresh
  # captures (exactly what update mode would write), staged in /tmp
  # so the checkout tree stays untouched until the commit job runs.
  rm -rf "$staged"
  mkdir -p "$staged"
  cp -r "$tool_dir/baselines/." "$staged/"
  cp -r "$out/actual/." "$staged/"

  # Luminance guard (issue #101): a dimmed or scrimmed capture set
  # must never be committed. The guard exits non-zero on any trip.
  echo "PR auto-commit: running the luminance guard over the fresh captures (issue #101)..."
  if ! node "$tool_dir/guard.mjs" --captures "$out/actual" --baselines "$tool_dir/baselines"; then
    echo "::error::PR auto-commit: luminance guard tripped - committing NOTHING. If the change is intentional and the captures are genuinely correct, investigate (issue #101) and regenerate via a manual mode=update dispatch from this branch."
    return 1
  fi

  # In-job verification: capture everything AGAIN and compare
  # against the regenerated set. The commit is only as good as this
  # proof - a set that cannot pass a fresh capture pass is not
  # committed, and the job fails instead.
  echo "PR auto-commit: re-capturing and comparing against the regenerated baselines (in-job verification)..."
  if ! node "$tool_dir/run.mjs" --baselines "$staged" --out "$out/verify"; then
    echo "::error::PR auto-commit: in-job re-compare against the regenerated baselines failed - committing NOTHING."
    return 1
  fi

  # Proven green: hand the staged set and a readiness marker to the
  # workflow (the marker step publishes the job output the
  # commit-pr-baselines job gates on).
  rm -rf /tmp/dsvr-pr-baselines
  cp -r "$staged" /tmp/dsvr-pr-baselines
  touch /tmp/dsvr-pr-autocommit-ready
  echo "PR auto-commit: regenerated baselines verified in-job; the commit-pr-baselines job will push them to this PR branch."
}

if [ "$MODE" = "update" ]; then
  node ../../tools/visual-regression/run.mjs --update --out /tmp/dsvr-out
elif [ "$MODE" = "pr-autocommit" ]; then
  pr_autocommit
else
  node ../../tools/visual-regression/run.mjs --out /tmp/dsvr-out
fi
