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
# Usage: capture-compare.sh [compare|update]
set -euo pipefail

MODE="${1:-compare}"
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT/apps/storybook"

npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleDebug --console=plain -q)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Deterministic capture surface: fixed density + font scale.
adb shell wm density 320
adb shell settings put system font_scale 1.0

# Debug builds load their JS bundle from Metro.
adb reverse tcp:8081 tcp:8081
(npx expo start --localhost > /tmp/metro.log 2>&1 &)
metro_up=""
for _ in $(seq 1 60); do
  if curl -sf http://localhost:8081/status > /dev/null; then
    metro_up="yes"
    break
  fi
  sleep 2
done
if [ -z "$metro_up" ]; then
  echo "Metro did not come up; last log lines:" >&2
  tail -20 /tmp/metro.log >&2
  exit 1
fi

# Pre-warm the bundle: the first request triggers the full module
# graph build (minutes on a cold CI runner). It must not eat into the
# driver's app-launch waits.
curl -sf -o /dev/null "http://localhost:8081/index.bundle?platform=android&dev=true&hot=false" || {
  echo "Metro bundle request failed; last log lines:" >&2
  tail -30 /tmp/metro.log >&2
  exit 1
}

if [ "$MODE" = "update" ]; then
  node ../../tools/visual-regression/run.mjs --update --out /tmp/dsvr-out
else
  node ../../tools/visual-regression/run.mjs --out /tmp/dsvr-out
fi
