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
# 2026-10-23): if the compare finds screenshot diffs — or stories
# with no baseline yet (bootstrap; a missing baseline never fails a
# compare, so without this trigger new stories could never acquire
# baselines through the PR flow — issue #128) — regenerate the
# baselines from the fresh captures IN THIS JOB — gated by the
# luminance guard (tools/visualRegression/guard.mjs, issue #101),
# the pixel-diff commit gate (tools/visualRegression/commitGate.mjs,
# issue #296: a capture replaces its baseline in the staged set
# only when its differing-pixel ratio exceeds the gate, so noise
# never lands as baseline churn), and an in-job re-capture/re-compare
# against the regenerated set — and hand the proven-green set to the
# workflow's commit-pr-baselines job, which pushes it onto the PR
# branch. Anything short of proven green (capture failures, a guard
# trip, a failed re-compare) commits NOTHING and fails the job. A
# run whose captures are all at or under the gate stages zero
# changed files and publishes nothing at all (issue #296).
#
# Captures are app-drawn full-content frames (issue #137): the
# host app draws each story's whole page — below the fold
# included — via the dsvr-capture native module and the driver
# pulls the PNG over adb; the display surface is never
# screenshotted for a story frame. Both capture sets below use
# that mechanism; the narrow variant's display settings change
# the layout the app measures, not the capture path.
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

# Affected-stories scoping (issue #114): the workflow's scope step
# writes a decision JSON (tools/visualRegression/scope.mjs — the
# PR's affected stories, or the full set when anything shared or
# unmappable changed). Compare modes honor it via run.mjs
# --scope-file; update mode always captures the full set (it exists
# to regenerate baselines) and ignores it. No file = unscoped.
SCOPE_FILE="${DSVR_SCOPE_FILE:-/tmp/dsvr-scope.json}"
SCOPE_ARGS=()
if [ "$MODE" != "update" ] && [ -f "$SCOPE_FILE" ]; then
  SCOPE_ARGS=(--scope-file "$SCOPE_FILE")
fi

# The APK is built by the workflow's background "Start APK build"
# step (build-apk.sh) so it overlaps the emulator boot; this waits
# for it (or builds in the foreground when run by hand).
bash "$VR_DIR/ci/wait-for-build.sh"
adb install -r android/app/build/outputs/apk/release/app-release.apk

# The two deterministic capture surfaces (see the header comment).
# Standard: the pixel_6's 1080px width at density 320 is a 540dp
# logical width — wide enough that fixed-width row children never
# squeeze flexible text. Narrow: Stephen's phone exactly — 1080px
# at density 500 is 345.6dp logical, and font_scale 1.3 grows the
# row's buttons from the other side (eciperay #205).
display_standard() {
  adb shell wm size reset
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
# pixel diffs (baseline-less stories count as a regeneration
# trigger, not a failure — see below), both sets pass the luminance guard, and both pass an
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
  if ! node "$tool_dir/run.mjs" --out "$out" "${SCOPE_ARGS[@]}"; then
    std_failed=1
  fi
  if ! run_narrow --out "$out_narrow" "${SCOPE_ARGS[@]}"; then
    narrow_failed=1
  fi
  # Classification spans both sets' summary files: a set that
  # passed contributes no failures; a set that failed without a
  # readable summary stops the flow. Regeneration is allowed when
  # every failure is a pixel diff, and also when the run merely
  # found stories with no baseline yet (bootstrap): a missing
  # baseline never fails the compare (deviceMode.mjs warns and
  # skips the story), so without this trigger a new story could
  # never acquire a baseline through the PR flow at all (issue
  # #128). The verdict line is verdict:missingBaselines:failures.
  local classify
  classify="$(node -e '
    const fs = require("node:fs");
    const failed = [];
    let missing = 0;
    for (const path of process.argv.slice(1)) {
      let s;
      try { s = JSON.parse(fs.readFileSync(path, "utf8")); }
      catch { console.log("unreadable:0:0"); process.exit(0); }
      if (Array.isArray(s.failed)) failed.push(...s.failed);
      if (Number.isInteger(s.noBaseline)) missing += s.noBaseline;
    }
    const diff = /: \d+\.\d+% pixels differ/;
    if (!failed.every((f) => diff.test(f))) { console.log(`other:${missing}:${failed.length}`); process.exit(0); }
    if (failed.length === 0 && missing === 0) { console.log("clean:0:0"); process.exit(0); }
    console.log(`regen:${missing}:${failed.length}`);
  ' "$out/summary.json" "$out_narrow/summary.json")"
  local verdict="${classify%%:*}" counts="${classify#*:}"
  local missing_count="${counts%%:*}" diff_count="${counts##*:}"
  if [ "$verdict" = "clean" ]; then
    if [ "$std_failed" = 0 ] && [ "$narrow_failed" = 0 ]; then
      echo "PR auto-commit: no diffs and no missing baselines - baselines already match; nothing to commit."
      return 0
    fi
    echo "::error::PR auto-commit: a compare failed but its summary shows no failures and no missing baselines (classification: $classify); NOT regenerating baselines. See the compare output above."
    return 1
  fi
  if [ "$verdict" != "regen" ]; then
    echo "::error::PR auto-commit: compare failed with non-diff failures (classification: $classify); NOT regenerating baselines. See the compare output above."
    return 1
  fi
  echo "PR auto-commit: regenerating baselines from the fresh captures ($diff_count pixel-diff failures, $missing_count stories with no baseline yet)."

  # The pixel-diff commit gate (issue #296): the effective gate
  # ratio comes from the tooling's named setting (commitGate.mjs, via
  # the commitGateCli.mjs CLI —
  # --print-gate respects the DSVR_COMMIT_MAX_RATIO override). The
  # in-job verification below compares with this same ratio: the
  # staged set is proven when a fresh capture pass agrees with it
  # to within the gate.
  local gate_ratio
  gate_ratio="$(node "$tool_dir/commitGateCli.mjs" --print-gate)"
  if [ -z "$gate_ratio" ]; then
    echo "::error::PR auto-commit: could not read the commit-gate ratio via commitGateCli.mjs --print-gate - committing NOTHING."
    return 1
  fi

  # The regenerated set: committed baselines overlaid with the fresh
  # captures of both sets — but ONLY where the commit gate stages a
  # capture (issue #296): a capture at or under the gate keeps its
  # committed baseline bytes, so render/re-encode noise never lands
  # in the bot commit. Staged in /tmp so the checkout tree stays
  # untouched until the commit job runs. The gate logs every
  # SKIP/STAGE decision plus a summary, and writes the counts to
  # /tmp/dsvr-commit-gate-summary.json for the publish step below.
  rm -rf "$staged"
  if ! node "$tool_dir/commitGateCli.mjs" \
    --baselines "$tool_dir/baselines" \
    --captures "$out/actual,$out_narrow/actual" \
    --out "$staged" \
    --summary /tmp/dsvr-commit-gate-summary.json; then
    echo "::error::PR auto-commit: commit-gate staging failed - committing NOTHING."
    return 1
  fi

  # Luminance guard (issue #101): a dimmed or scrimmed capture set
  # must never be committed. The guard exits non-zero on any trip.
  # It runs per set: it judges each capture against its OWN
  # baseline, and the standard and narrow surfaces have different
  # brightness profiles by construction. A set scoped to zero
  # stories (issue #114) produced no captures and has nothing to
  # guard — the guard itself refuses an empty captures dir.
  echo "PR auto-commit: running the luminance guard over the fresh captures (issue #101)..."
  guard_set() {
    # $1 = captures dir, $2 = set label for messages
    if ! find "$1" -name '*.png' -print -quit 2>/dev/null | grep -q .; then
      echo "PR auto-commit: no fresh captures for the $2 set — skipping its luminance guard."
      return 0
    fi
    node "$tool_dir/guard.mjs" --captures "$1" --baselines "$tool_dir/baselines"
  }
  if ! guard_set "$out/actual" "standard"; then
    echo "::error::PR auto-commit: luminance guard tripped on the standard set - committing NOTHING. If the change is intentional and the captures are genuinely correct, investigate (issue #101) and regenerate via a manual mode=update dispatch from this branch."
    return 1
  fi
  if ! guard_set "$out_narrow/actual" "narrow-variant"; then
    echo "::error::PR auto-commit: luminance guard tripped on the narrow-variant set - committing NOTHING. If the change is intentional and the captures are genuinely correct, investigate (issue #101) and regenerate via a manual mode=update dispatch from this branch."
    return 1
  fi

  # In-job verification: capture everything AGAIN (both sets) and
  # compare against the regenerated set. The commit is only as good
  # as this proof - a set that cannot pass a fresh capture pass is
  # not committed, and the job fails instead.
  echo "PR auto-commit: re-capturing and comparing against the regenerated baselines (in-job verification, tolerance = commit gate ${gate_ratio})..."
  if ! node "$tool_dir/run.mjs" --baselines "$staged" --out "$out/verify" --max-ratio "$gate_ratio" "${SCOPE_ARGS[@]}"; then
    echo "::error::PR auto-commit: in-job re-compare of the standard set against the regenerated baselines failed - committing NOTHING."
    return 1
  fi
  if ! run_narrow --baselines "$staged" --out "$out_narrow/verify" --max-ratio "$gate_ratio" "${SCOPE_ARGS[@]}"; then
    echo "::error::PR auto-commit: in-job re-compare of the narrow-variant set against the regenerated baselines failed - committing NOTHING."
    return 1
  fi

  # Proven green — but if the commit gate staged zero changed
  # files, the "regenerated" set is byte-identical to the committed
  # baselines: publish nothing, so the run produces NO baseline
  # commit (issue #296's acceptance). The commit job's own
  # git-status guard is a second safety net, never the mechanism.
  local staged_count
  staged_count="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync("/tmp/dsvr-commit-gate-summary.json", "utf8")).staged)')"
  local skipped_count
  skipped_count="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync("/tmp/dsvr-commit-gate-summary.json", "utf8")).skipped)')"
  if [ "$skipped_count" != "0" ]; then
    echo "::warning::PR auto-commit: $skipped_count capture(s) differ from their committed baselines but were at or under the commit gate, so they were NOT committed (see the commit-gate SKIP lines above). They still differ under the strict compare; if any is a genuine change, re-run update mode with a lowered gate (--commit-max-ratio / DSVR_COMMIT_MAX_RATIO) to commit it deliberately."
  fi
  if [ "$staged_count" = "0" ]; then
    echo "PR auto-commit: commit gate staged 0 files — every capture was at or under the gate (noise) or matched its baseline. Baselines unchanged; nothing to commit."
    return 0
  fi

  # Hand the staged set and a readiness marker to the workflow (the
  # marker step publishes the job output the commit-pr-baselines
  # job gates on).
  rm -rf /tmp/dsvr-pr-baselines
  cp -r "$staged" /tmp/dsvr-pr-baselines
  touch /tmp/dsvr-pr-autocommit-ready
  echo "PR auto-commit: regenerated baselines verified in-job ($staged_count file(s) staged by the commit gate); the commit-pr-baselines job will push them to this PR branch."
}

if [ "$MODE" = "update" ]; then
  node "$VR_DIR/run.mjs" --update --out /tmp/dsvr-out
  run_narrow --update --out /tmp/dsvr-out-narrow
elif [ "$MODE" = "pr-autocommit" ]; then
  pr_autocommit
else
  # Compare mode: both sets; the run fails if either set fails.
  compare_rc=0
  node "$VR_DIR/run.mjs" --out /tmp/dsvr-out "${SCOPE_ARGS[@]}" || compare_rc=1
  run_narrow --out /tmp/dsvr-out-narrow "${SCOPE_ARGS[@]}" || compare_rc=1
  if [ "$compare_rc" != 0 ]; then
    echo "::error::Compare failed for at least one capture set (see the standard and narrow-variant output above)."
    exit 1
  fi
fi
