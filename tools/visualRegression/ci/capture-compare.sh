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
# Usage: capture-compare.sh [compare|update|pr-autocommit|pr-shard|stage-merged|verify-merged]
#
# Modes compare/update are the workflow_dispatch modes. Mode
# pr-autocommit is the serial pull_request flow (Stephen's directive,
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
# against the regenerated set — scoped to the staged baselines
# (issue #432 phase 1: a zero-staged run skips the verification pass
# entirely, a staged set over 25% of the capture scope falls back
# to a full re-capture, and a scoped re-compare that disagrees
# falls back to a full one) — and hand the proven-green set to the
# workflow's commit-pr-baselines job, which pushes it onto the PR
# branch. Anything short of proven green (capture failures, a guard
# trip, a failed re-compare) commits NOTHING and fails the job. A
# run whose captures are all at or under the gate stages zero
# changed files and publishes nothing at all (issue #296).
#
# Sharded pull_request flow (issue #432 phase 2): the workflow's
# plan job splits the capture scope across a matrix of emulator
# jobs (tools/visualRegression/shardScope.mjs); each matrix job
# runs mode pr-shard, which is ONLY the compare pass over its slice
# plus the clean/regen/other classification — it regenerates
# nothing. The workflow's merge-verify job then unions the shards'
# captures (ci/mergeShards.mjs), runs mode stage-merged (the commit
# gate + luminance guard over the UNION, no emulator needed), and —
# when the gate staged anything — mode verify-merged on one
# emulator: the phase-1 verification re-capture, run once over the
# merged staged set, and the publish step. The gate, guard, and
# verification code is shared verbatim with the serial pr-autocommit
# flow (the functions below), so a sharded run stages and proves
# exactly the set a serial run on the same head would. Mode
# pr-autocommit remains the serial path: local runs, and the
# reference the sharded flow is checked against.
#
# Captures are app-drawn full-content frames (issue #137): the
# host app draws each story's whole page — below the fold
# included — via the dsvr-capture native module and the driver
# pulls the PNG over adb; the display surface is never
# screenshotted for a story frame. Both capture sets below use
# that mechanism; the narrow variant's display settings change
# the layout the app measures, not the capture path.
#
# Every capture mode runs TWO capture sets against the same install:
#   1. the standard set (all in-scope page stories) at the pinned
#      standard display (wm density 320, font_scale 1.0), and
#   2. the narrow-viewport variant (run.mjs --variant narrow):
#      ONLY the RecipesPage stories, with the display switched to
#      wm size 1080x2400 + wm density 500 (345.6dp logical width)
#      + font_scale 1.3 — the display-size override + font size on
#      Stephen's Pixel 8a that shipped eciperay #205, whose fix
#      (design-system PR #117) moved ZERO standard baselines
#      because the standard surface is 540dp wide and the row
#      never starves there. Variant baselines are the same
#      stories' baselines with a "--narrow" filename segment
#      (baselineResolver.mjs), so both sets flow through the same
#      guard / regenerate / commit machinery; the standard
#      display is restored after the variant pass no matter how
#      it ends.
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
# Sharded runs (issue #432 phase 2) point DSVR_SCOPE_FILE at the
# shard's slice of the decision (shardScope.mjs); the verify-merged
# mode points it at the ORIGINAL decision, which its full-scope
# verification fallback needs.
SCOPE_FILE="${DSVR_SCOPE_FILE:-/tmp/dsvr-scope.json}"
SCOPE_ARGS=()
if [ "$MODE" != "update" ] && [ -f "$SCOPE_FILE" ]; then
  SCOPE_ARGS=(--scope-file "$SCOPE_FILE")
fi

# The shared capture/staging locations. The sharded flow's separate
# invocations (pr-shard on the matrix jobs, stage-merged and
# verify-merged on the merge-verify job) hand state to each other
# through these paths and the workflow's artifacts, exactly as the
# serial flow's passes hand state within one invocation.
OUT_DIR=/tmp/dsvr-out
OUT_NARROW_DIR=/tmp/dsvr-out-narrow
STAGED_DIR=/tmp/dsvr-staged-baselines
GATE_SUMMARY=/tmp/dsvr-commit-gate-summary.json
# The committed baselines in canonical tree form
# (<theme>/<storyId>.png), materialized from their colocated
# committed layout (src/**/__snapshots__/, issue #530) by
# baselinesLayout.mjs. The commit gate, the luminance guard, and
# the verification scope all consume this tree; the update mode
# refreshes it as the workflow artifact's source.
BASELINES_TREE=/tmp/dsvr-baselines-tree

materialize_baselines_tree() {
  rm -rf "$BASELINES_TREE"
  node "$VR_DIR/baselinesLayout.mjs" materialize --out "$BASELINES_TREE"
}
# The effective commit-gate ratio, set by read_gate_ratio (and by
# stage_and_guard, which reads it as part of staging).
GATE_RATIO=""

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

# Device preparation for every mode that captures: wait for the
# workflow's background APK build (or build in the foreground when
# run by hand), install, and pin the deterministic capture surface.
# Mode stage-merged never touches a device — it gates and guards
# captures other jobs already made — so it skips this entirely.
prepare_device() {
  bash "$VR_DIR/ci/wait-for-build.sh"
  adb install -r android/app/build/outputs/apk/release/app-release.apk

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
}

# Classify a compare pass from its two sets' summary files. Echoes
# "<verdict>:<missing>:<diffs>" where the verdict is:
#   clean — no failures and no missing baselines;
#   regen — every failure is a pixel diff, or the only trigger is
#           stories with no baseline yet (bootstrap, issue #128);
#   other — a non-diff failure, or a summary that cannot be read:
#           regeneration is NOT allowed.
# The verdict line is verdict:missingBaselines:failures.
classify_summaries() {
  node -e '
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
  ' "$OUT_DIR/summary.json" "$OUT_NARROW_DIR/summary.json"
}

# Read the effective commit-gate ratio (issue #296) into GATE_RATIO:
# the tooling's named setting via the commitGateCli.mjs CLI
# (--print-gate respects the DSVR_COMMIT_MAX_RATIO override). The
# verification passes compare with this same ratio: the staged set
# is proven when a fresh capture pass agrees with it to within the
# gate. Returns 1 when the ratio cannot be read.
read_gate_ratio() {
  GATE_RATIO="$(node "$VR_DIR/commitGateCli.mjs" --print-gate)"
  if [ -z "$GATE_RATIO" ]; then
    echo "::error::PR auto-commit: could not read the commit-gate ratio via commitGateCli.mjs --print-gate - committing NOTHING."
    return 1
  fi
}

# Build the staged baseline set from the fresh captures in
# $OUT_DIR/$OUT_NARROW_DIR and run the luminance guard over them.
# The staged set is the committed baselines overlaid with the fresh
# captures — but ONLY where the commit gate stages a capture (issue
# #296): a capture at or under the gate keeps its committed baseline
# bytes, so render/re-encode noise never lands in the bot commit.
# Staged in /tmp so the checkout tree stays untouched until the
# commit job runs. The gate logs every SKIP/STAGE decision plus a
# summary, and writes the counts to $GATE_SUMMARY for the
# verification/publish steps. Any failure here commits NOTHING.
stage_and_guard() {
  if ! read_gate_ratio; then
    return 1
  fi
  if ! materialize_baselines_tree; then
    echo "::error::PR auto-commit: could not materialize the committed baselines - committing NOTHING."
    return 1
  fi
  rm -rf "$STAGED_DIR"
  if ! node "$VR_DIR/commitGateCli.mjs" \
    --baselines "$BASELINES_TREE" \
    --captures "$OUT_DIR/actual,$OUT_NARROW_DIR/actual" \
    --out "$STAGED_DIR" \
    --summary "$GATE_SUMMARY"; then
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
    node "$VR_DIR/guard.mjs" --captures "$1" --baselines "$BASELINES_TREE"
  }
  if ! guard_set "$OUT_DIR/actual" "standard"; then
    echo "::error::PR auto-commit: luminance guard tripped on the standard set - committing NOTHING. If the change is intentional and the captures are genuinely correct, investigate (issue #101) and regenerate via a manual mode=update dispatch from this branch."
    return 1
  fi
  if ! guard_set "$OUT_NARROW_DIR/actual" "narrow-variant"; then
    echo "::error::PR auto-commit: luminance guard tripped on the narrow-variant set - committing NOTHING. If the change is intentional and the captures are genuinely correct, investigate (issue #101) and regenerate via a manual mode=update dispatch from this branch."
    return 1
  fi
}

# Prove the staged set ($STAGED_DIR, counts in $GATE_SUMMARY) with
# the phase-1 verification re-capture and, when it proves green and
# the gate staged at least one file, publish it to
# /tmp/dsvr-pr-baselines with the readiness marker the workflow's
# commit-pr-baselines job gates on. Requires GATE_RATIO to be set
# (read_gate_ratio / stage_and_guard). Returns 1 — committing
# NOTHING — when the proof fails.
verify_and_publish() {
  # The commit-gate counts, read before verification: the staged
  # count drives the verification scope below (issue #432) and the
  # publish decision after it.
  local staged_count
  staged_count="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).staged)' "$GATE_SUMMARY")"
  # The verification ratio's denominator: the number of captures
  # the commit gate gated — i.e. this run's capture scope (issue
  # #432 review: dividing by the staged tree's full baseline count
  # would understate the staged share in a scoped run).
  local captured_count
  captured_count="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).captured)' "$GATE_SUMMARY")"

  # In-job verification scope (issue #432 phase 1): re-capture only
  # what the commit gate actually staged. verifyScope.mjs compares
  # the staged tree against the committed baselines and writes a
  # scope decision in the scope.mjs shape. The luminance guard
  # above still runs over the FULL fresh capture sets and a trip
  # still commits nothing — scoping never bypasses it.
  local verify_scope_file=/tmp/dsvr-verify-scope.json
  if [ ! -d "$BASELINES_TREE" ] && ! materialize_baselines_tree; then
    echo "::error::PR auto-commit: could not materialize the committed baselines for the verification scope - committing NOTHING."
    return 1
  fi
  if ! node "$VR_DIR/verifyScope.mjs" --baselines "$BASELINES_TREE" --staged "$STAGED_DIR" --capture-total "$captured_count" --out "$verify_scope_file"; then
    echo "::error::PR auto-commit: could not compute the verification scope via verifyScope.mjs - committing NOTHING."
    return 1
  fi
  local verify_mode verify_std_count verify_narrow_count
  verify_mode="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync("/tmp/dsvr-verify-scope.json", "utf8")).mode)')"
  verify_std_count="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync("/tmp/dsvr-verify-scope.json", "utf8")).standard.length)')"
  verify_narrow_count="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync("/tmp/dsvr-verify-scope.json", "utf8")).narrow.length)')"

  # Full verification: capture everything in the run's original
  # scope AGAIN (both sets) and compare against the regenerated
  # set — the pre-#432 proof, used when the staged set is wide and
  # as the fallback when a scoped re-compare disagrees.
  run_full_verification() {
    if ! node "$VR_DIR/run.mjs" --baselines "$STAGED_DIR" --out "$OUT_DIR/verify" --max-ratio "$GATE_RATIO" "${SCOPE_ARGS[@]}"; then
      echo "::error::PR auto-commit: in-job re-compare of the standard set against the regenerated baselines failed - committing NOTHING."
      return 1
    fi
    if ! run_narrow --baselines "$STAGED_DIR" --out "$OUT_NARROW_DIR/verify" --max-ratio "$GATE_RATIO" "${SCOPE_ARGS[@]}"; then
      echo "::error::PR auto-commit: in-job re-compare of the narrow-variant set against the regenerated baselines failed - committing NOTHING."
      return 1
    fi
  }

  if [ "$verify_mode" = "skip" ]; then
    # Zero staged files: the "regenerated" set is byte-identical to
    # the committed baselines, already proven by the compare pass
    # itself — a re-capture would prove nothing (issue #432).
    echo "PR auto-commit: skipping the in-job verification re-capture — the commit gate staged 0 files, so the regenerated set is the committed set the compare pass already proved."
  elif [ "$verify_mode" = "scoped" ]; then
    echo "PR auto-commit: re-capturing and comparing ONLY the staged baselines against the regenerated set (in-job verification, scoped by issue #432; tolerance = commit gate ${GATE_RATIO})..."
    local scoped_failed=0
    if [ "$verify_std_count" != "0" ]; then
      if ! node "$VR_DIR/run.mjs" --baselines "$STAGED_DIR" --out "$OUT_DIR/verify" --max-ratio "$GATE_RATIO" --scope-file "$verify_scope_file"; then
        scoped_failed=1
      fi
    else
      echo "PR auto-commit: no staged standard baselines — skipping the standard verification set."
    fi
    if [ "$verify_narrow_count" != "0" ]; then
      if ! run_narrow --baselines "$STAGED_DIR" --out "$OUT_NARROW_DIR/verify" --max-ratio "$GATE_RATIO" --scope-file "$verify_scope_file"; then
        scoped_failed=1
      fi
    else
      echo "PR auto-commit: no staged narrow baselines or counterparts — skipping the narrow verification set."
    fi
    if [ "$scoped_failed" != "0" ]; then
      # A staged file's re-capture disagreed: do not trust the
      # scoped proof either way — fall back to the full re-capture,
      # whose verdict decides (issue #432 safety rail).
      echo "::warning::PR auto-commit: the scoped verification re-compare failed — falling back to a full verification re-capture before deciding."
      if ! run_full_verification; then
        return 1
      fi
    fi
  else
    # In-job verification: capture everything AGAIN (both sets) and
    # compare against the regenerated set. The commit is only as
    # good as this proof - a set that cannot pass a fresh capture
    # pass is not committed, and the job fails instead.
    echo "PR auto-commit: re-capturing and comparing against the regenerated baselines (in-job verification, tolerance = commit gate ${GATE_RATIO})..."
    if ! run_full_verification; then
      return 1
    fi
  fi

  # Proven green — but if the commit gate staged zero changed
  # files, the "regenerated" set is byte-identical to the committed
  # baselines: publish nothing, so the run produces NO baseline
  # commit (issue #296's acceptance). The commit job's own
  # git-status guard is a second safety net, never the mechanism.
  local skipped_strict_count
  skipped_strict_count="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).skippedStrict)' "$GATE_SUMMARY")"
  if [ "$skipped_strict_count" != "0" ]; then
    echo "::warning::PR auto-commit: $skipped_strict_count capture(s) FAIL the strict compare but were at or under the commit gate, so they were NOT committed (see the commit-gate SKIP lines above). If any is a genuine change, commit it deliberately by running update mode LOCALLY with a lowered gate (the Actions update dispatch accepts no gate override), e.g. DSVR_COMMIT_MAX_RATIO=0 bash tools/visualRegression/ci/capture-compare.sh update — the script's update mode covers both the standard and narrow capture sets."
  fi
  if [ "$staged_count" = "0" ]; then
    echo "PR auto-commit: commit gate staged 0 files — every capture was at or under the gate (noise) or matched its baseline. Baselines unchanged; nothing to commit."
    return 0
  fi

  # Hand the staged set and a readiness marker to the workflow (the
  # marker step publishes the job output the commit-pr-baselines
  # job gates on).
  rm -rf /tmp/dsvr-pr-baselines
  cp -r "$STAGED_DIR" /tmp/dsvr-pr-baselines
  touch /tmp/dsvr-pr-autocommit-ready
  echo "PR auto-commit: regenerated baselines verified in-job ($staged_count file(s) staged by the commit gate); the commit-pr-baselines job will push them to this PR branch."
}

# Run the compare pass of BOTH capture sets (standard, then narrow
# variant) against the committed baselines, honoring SCOPE_ARGS.
# Returns 0 only when both sets' drivers exited 0; the summaries
# on disk carry the detail either way.
compare_both_sets() {
  local std_failed=0 narrow_failed=0
  if ! node "$VR_DIR/run.mjs" --out "$OUT_DIR" "${SCOPE_ARGS[@]}"; then
    std_failed=1
  fi
  if ! run_narrow --out "$OUT_NARROW_DIR" "${SCOPE_ARGS[@]}"; then
    narrow_failed=1
  fi
  [ "$std_failed" = 0 ] && [ "$narrow_failed" = 0 ]
}

# Serial PR auto-commit flow. Runs entirely inside this job; the
# workflow's commit-pr-baselines job only pushes what this flow
# stages. Both capture sets go through the same cycle: a set may
# only be regenerated when its failures are all pixel diffs
# (baseline-less stories count as a regeneration trigger, not a
# failure), both sets pass the luminance guard, and both pass an
# in-job re-capture/re-compare against the regenerated baselines.
# The staged tree is shared — variant baselines differ from standard
# ones only by their "-narrow" filename suffix.
pr_autocommit() {
  # Pass 1: the ordinary strict compare of BOTH sets against the
  # committed baselines.
  echo "PR auto-commit: compare pass against committed baselines (standard set, then narrow variant)..."
  local compare_ok=0
  compare_both_sets || compare_ok=1
  # Classification spans both sets' summary files: a set that
  # passed contributes no failures; a set that failed without a
  # readable summary stops the flow.
  local classify
  classify="$(classify_summaries)"
  local verdict="${classify%%:*}" counts="${classify#*:}"
  local missing_count="${counts%%:*}" diff_count="${counts##*:}"
  if [ "$verdict" = "clean" ]; then
    if [ "$compare_ok" = 0 ]; then
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

  if ! stage_and_guard; then
    return 1
  fi
  verify_and_publish
}

# Sharded PR flow, compare side (issue #432 phase 2): run ONLY the
# compare pass over this shard's slice (DSVR_SCOPE_FILE points at
# the shard scope) and record the classification in
# /tmp/dsvr-shard-result.json, in the shape ci/mergeShards.mjs
# consumes. Pixel diffs and missing baselines are a "regen" verdict
# and a SUCCESSFUL shard — regeneration is a global decision the
# merge-verify job makes over the union of all shards. A non-diff
# failure fails the shard, exactly as it stops the serial flow.
pr_shard() {
  echo "PR shard: compare pass over this shard's slice against committed baselines (standard set, then narrow variant)..."
  local compare_ok=0
  compare_both_sets || compare_ok=1
  local classify
  classify="$(classify_summaries)"
  local verdict="${classify%%:*}" counts="${classify#*:}"
  local missing_count="${counts%%:*}" diff_count="${counts##*:}"
  # The merge job aggregates shard verdicts; an unreadable summary
  # (the classifier's own failure shape) is a non-diff failure.
  if [ "$verdict" = "unreadable" ]; then
    verdict="other"
  fi
  node -e 'require("node:fs").writeFileSync("/tmp/dsvr-shard-result.json", JSON.stringify({ verdict: process.argv[1], missing: Number(process.argv[2]), diffs: Number(process.argv[3]) }, null, 2) + "\n")' "$verdict" "$missing_count" "$diff_count"
  echo "PR shard: classification $classify."
  if [ "$verdict" = "clean" ] && [ "$compare_ok" != 0 ]; then
    echo "::error::PR shard: a compare failed but its summary shows no failures and no missing baselines (classification: $classify); failing the shard. See the compare output above."
    return 1
  fi
  if [ "$verdict" = "other" ]; then
    echo "::error::PR shard: compare failed with non-diff failures (classification: $classify); failing the shard. See the compare output above."
    return 1
  fi
  return 0
}

# Sharded PR flow, merge side part 1 (issue #432 phase 2): the
# captures in $OUT_DIR/$OUT_NARROW_DIR are the UNION of every
# shard's captures (ci/mergeShards.mjs merged them, and refused an
# incomplete or colliding union). Run the commit gate + luminance
# guard over the union — the same stage_and_guard the serial flow
# runs — and record the gate counts in /tmp/dsvr-stage-result.json
# so the workflow can skip the verification emulator entirely when
# the gate staged zero files. No device is involved.
stage_merged() {
  if ! stage_and_guard; then
    return 1
  fi
  node -e 'const s = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")); require("node:fs").writeFileSync("/tmp/dsvr-stage-result.json", JSON.stringify({ staged: s.staged, captured: s.captured }, null, 2) + "\n"); console.log(`stage-merged: commit gate staged ${s.staged} of ${s.captured} union capture(s).`)' "$GATE_SUMMARY"
}

# Sharded PR flow, merge side part 2 (issue #432 phase 2): the
# staged set and gate summary from stage_merged are on disk; run
# the phase-1 verification re-capture ONCE over the merged staged
# set and publish — the same verify_and_publish the serial flow
# runs after its in-job staging.
verify_merged() {
  if [ ! -f "$GATE_SUMMARY" ] || [ ! -d "$STAGED_DIR" ]; then
    echo "::error::verify-merged: the staged set or gate summary from stage-merged is missing - committing NOTHING."
    return 1
  fi
  if ! read_gate_ratio; then
    return 1
  fi
  verify_and_publish
}

if [ "$MODE" != "stage-merged" ]; then
  prepare_device
fi

if [ "$MODE" = "update" ]; then
  node "$VR_DIR/run.mjs" --update --out /tmp/dsvr-out
  run_narrow --update --out /tmp/dsvr-out-narrow
  # Update mode wrote the baselines in-tree at their colocated
  # paths (issue #530); materialize the canonical tree the
  # workflow uploads as the dsvr-baselines artifact, which the
  # commit-baselines job publishes back into the tree.
  materialize_baselines_tree
elif [ "$MODE" = "pr-autocommit" ]; then
  pr_autocommit
elif [ "$MODE" = "pr-shard" ]; then
  pr_shard
elif [ "$MODE" = "stage-merged" ]; then
  stage_merged
elif [ "$MODE" = "verify-merged" ]; then
  verify_merged
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
