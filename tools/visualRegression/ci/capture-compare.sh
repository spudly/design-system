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
# luminance guard (tools/visualRegression/guard.mjs, issue #101)
# and an in-job re-capture/re-compare against the regenerated set —
# and hand the proven-green set to the workflow's
# commit-pr-baselines job, which pushes it onto the PR branch.
# Anything short of proven green (capture failures, a guard trip, a
# failed re-compare) commits NOTHING and fails the job.
#
# Every mode runs TWO capture sets against the same install:
#   1. the standard set (all in-scope page stories) at the pinned
#      standard display (wm density 320, font_scale 1.0), and
#   2. the narrow-viewport variant (run.mjs --variant narrow):
#      ONLY the RecipesPage stories, with the display switched to
#      wm size 1080x2400 + wm density 500 (345.6dp logical width)
#      + font_scale 1.3 — the display-size override + font size on
#      Stephen's Pixel 8a that shipped eciperay #205, whose fix
#      (design-system PR #117) moved ZERO standard baselines
#      because the standard surface is 540dp wide and the row
#      never starves there. Variant baselines sit beside the
#      standard ones with a "-narrow" filename suffix, so both
#      sets flow through the same guard / regenerate / commit
#      machinery; the standard display is restored after the
#      variant pass no matter how it ends.
set -euo pipefail

MODE="${1:-compare}"
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
VR_DIR="$REPO_ROOT/tools/visualRegression"
cd "$REPO_ROOT/apps/storybook"

npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease --console=plain -q)
adb install -r android/app/build/outputs/apk/release/app-release.apk

# The two deterministic capture surfaces (see the header comment).
# Standard: the pixel_6's 1080px width at density 320 is a 540dp
# logical width — wide enough that fixed-width row children never
# squeeze flexible text. Narrow: Stephen's phone exactly — 1080px
# at density 500 is 345.6dp logical, and font_scale 1.3 grows the
# row's buttons from the other side (eciperay #205).
display_standard() {
  # SPIKE (issue #137): DSVR_SPIKE_SURFACE_H pins a tall surface
  # (e.g. 8000) instead of the pixel_6's native 1080x2400, so one
  # screencap holds the whole page; unset = production behavior.
  if [ -n "${DSVR_SPIKE_SURFACE_H:-}" ]; then
    adb shell wm size "1080x${DSVR_SPIKE_SURFACE_H}"
    # SPIKE (issue #137, runs A/A2): at a tall surface the Pixel
    # Launcher — which renders its workspace at full display size
    # under swiftshader — stalls past the ANR threshold, and its
    # "isn't responding" dialog + frozen backdrop contaminate
    # every capture (the known #112 dialog, made systematic).
    # The capture flow never needs the launcher (explicit component
    # launch + deep links), so disable the package for the session
    # (CI emulators are throwaway; nothing to restore).
    adb shell pm disable-user --user 0 com.google.android.apps.nexuslauncher || true
  else
    adb shell wm size reset
  fi
  adb shell wm density 320
  adb shell settings put system font_scale 1.0
}
display_narrow() {
  adb shell wm size 1080x2400
  adb shell wm density 500
  adb shell settings put system font_scale 1.3
}

# Run the driver for the narrow variant: switch the display, run,
# and restore the standard display before returning, whatever the
# run's outcome was (a later pass or the workflow's failure
# artifacts must never inherit the narrow surface).
run_narrow() {
  local rc=0
  display_narrow
  node "$VR_DIR/run.mjs" --variant narrow "$@" || rc=$?
  display_standard
  return $rc
}

# SPIKE (issue #137) driver args for the STANDARD set only: a
# story-substring scope (DSVR_SPIKE_STORIES) and the blank-tail
# crop, enabled whenever a tall surface is pinned. Unset env =
# empty args = today's behavior exactly.
SPIKE_ARGS=()
if [ -n "${DSVR_SPIKE_STORIES:-}" ]; then
  SPIKE_ARGS+=(--stories "$DSVR_SPIKE_STORIES")
fi
if [ -n "${DSVR_SPIKE_SURFACE_H:-}" ]; then
  SPIKE_ARGS+=(--crop-tall)
fi

# Deterministic capture surface: fixed density + font scale.
display_standard

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
# commit-pr-baselines job only pushes what this flow stages. Both
# capture sets (standard + narrow variant) go through the same
# cycle: a set may only be regenerated when its failures are all
# pixel diffs, both sets pass the luminance guard, and both pass an
# in-job re-capture/re-compare against the regenerated baselines.
# The staged tree is shared — variant baselines differ from standard
# ones only by their "-narrow" filename suffix.
pr_autocommit() {
  local tool_dir="$VR_DIR"
  local out=/tmp/dsvr-out
  local out_narrow=/tmp/dsvr-out-narrow
  local staged=/tmp/dsvr-staged-baselines

  # Pass 1: the ordinary strict compare of BOTH sets against the
  # committed baselines.
  echo "PR auto-commit: compare pass against committed baselines (standard set, then narrow variant)..."
  local std_failed=0 narrow_failed=0
  if ! node "$tool_dir/run.mjs" --out "$out" "${SPIKE_ARGS[@]}"; then
    std_failed=1
  fi
  if ! run_narrow --out "$out_narrow"; then
    narrow_failed=1
  fi
  if [ "$std_failed" = 0 ] && [ "$narrow_failed" = 0 ]; then
    echo "PR auto-commit: no diffs - baselines already match; nothing to commit."
    return 0
  fi

  # Only a run whose failures are ALL pixel diffs may regenerate.
  # A capture failure (deep link, READY timeout, screencap) means
  # the fresh set is incomplete, and an incomplete set must never
  # become the baselines. Classification spans both sets' summary
  # files: a set that passed contributes no failures; a set that
  # failed without a readable summary stops the flow.
  local classify
  classify="$(node -e '
    const fs = require("node:fs");
    const failed = [];
    for (const path of process.argv.slice(1)) {
      let s;
      try { s = JSON.parse(fs.readFileSync(path, "utf8")); }
      catch { console.log("unreadable"); process.exit(0); }
      if (Array.isArray(s.failed)) failed.push(...s.failed);
    }
    if (failed.length === 0) { console.log("none"); process.exit(0); }
    const diff = /: \d+\.\d+% pixels differ/;
    console.log(failed.every((f) => diff.test(f)) ? "diffs-only" : "other");
  ' "$out/summary.json" "$out_narrow/summary.json")"
  if [ "$classify" != "diffs-only" ]; then
    echo "::error::PR auto-commit: compare failed with non-diff failures (classification: $classify); NOT regenerating baselines. See the compare output above."
    return 1
  fi
  echo "PR auto-commit: compare found only pixel diffs; regenerating baselines from the fresh captures."

  # The regenerated set: committed baselines overlaid with the fresh
  # captures of both sets (exactly what update mode would write),
  # staged in /tmp so the checkout tree stays untouched until the
  # commit job runs.
  rm -rf "$staged"
  mkdir -p "$staged"
  cp -r "$tool_dir/baselines/." "$staged/"
  if [ -d "$out/actual" ]; then cp -r "$out/actual/." "$staged/"; fi
  if [ -d "$out_narrow/actual" ]; then cp -r "$out_narrow/actual/." "$staged/"; fi

  # Luminance guard (issue #101): a dimmed or scrimmed capture set
  # must never be committed. The guard exits non-zero on any trip.
  # It runs per set: it judges each capture against its OWN
  # baseline, and the standard and narrow surfaces have different
  # brightness profiles by construction.
  echo "PR auto-commit: running the luminance guard over the fresh captures (issue #101)..."
  if ! node "$tool_dir/guard.mjs" --captures "$out/actual" --baselines "$tool_dir/baselines"; then
    echo "::error::PR auto-commit: luminance guard tripped on the standard set - committing NOTHING. If the change is intentional and the captures are genuinely correct, investigate (issue #101) and regenerate via a manual mode=update dispatch from this branch."
    return 1
  fi
  if ! node "$tool_dir/guard.mjs" --captures "$out_narrow/actual" --baselines "$tool_dir/baselines"; then
    echo "::error::PR auto-commit: luminance guard tripped on the narrow-variant set - committing NOTHING. If the change is intentional and the captures are genuinely correct, investigate (issue #101) and regenerate via a manual mode=update dispatch from this branch."
    return 1
  fi

  # In-job verification: capture everything AGAIN (both sets) and
  # compare against the regenerated set. The commit is only as good
  # as this proof - a set that cannot pass a fresh capture pass is
  # not committed, and the job fails instead.
  echo "PR auto-commit: re-capturing and comparing against the regenerated baselines (in-job verification)..."
  if ! node "$tool_dir/run.mjs" --baselines "$staged" --out "$out/verify" "${SPIKE_ARGS[@]}"; then
    echo "::error::PR auto-commit: in-job re-compare of the standard set against the regenerated baselines failed - committing NOTHING."
    return 1
  fi
  if ! run_narrow --baselines "$staged" --out "$out_narrow/verify"; then
    echo "::error::PR auto-commit: in-job re-compare of the narrow-variant set against the regenerated baselines failed - committing NOTHING."
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
  node "$VR_DIR/run.mjs" --update --out /tmp/dsvr-out "${SPIKE_ARGS[@]}"
  if [ -n "${DSVR_SPIKE_STORIES:-}" ]; then
    echo "SPIKE (issue #137): story scope set — skipping the narrow variant."
  else
    run_narrow --update --out /tmp/dsvr-out-narrow
  fi
elif [ "$MODE" = "pr-autocommit" ]; then
  pr_autocommit
else
  # Compare mode: both sets; the run fails if either set fails.
  compare_rc=0
  node "$VR_DIR/run.mjs" --out /tmp/dsvr-out "${SPIKE_ARGS[@]}" || compare_rc=1
  if [ -n "${DSVR_SPIKE_STORIES:-}" ]; then
    echo "SPIKE (issue #137): story scope set — skipping the narrow variant."
  else
    run_narrow --out /tmp/dsvr-out-narrow || compare_rc=1
  fi
  if [ "$compare_rc" != 0 ]; then
    echo "::error::Compare failed for at least one capture set (see the standard and narrow-variant output above)."
    exit 1
  fi
fi
