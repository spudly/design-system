#!/usr/bin/env bash
# CI driver for the #162 sanity job (see capture-compare.sh for why
# this lives in a file instead of the workflow's script block).
#
# Captures the SearchField stories clean, applies
# tools/visual-regression/sanity/searchfield-162.patch (pre-fix text
# glyph with numeric lineHeight, clip-box hardening removed),
# recaptures, and succeeds ONLY if the comparison fails — i.e. the
# pipeline is sensitive to the bug on Android. Only the JS bundle
# changes under the patch, so a force-stop + relaunch re-fetches it
# from Metro; no native rebuild.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT/apps/storybook"

npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleDebug --console=plain -q)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Generous logcat buffer: the driver reads the full log back.
adb logcat -G 8M

adb shell wm density 320
adb shell settings put system font_scale 1.0

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

# Pre-warm the bundle (see capture-compare.sh).
curl -sf -o /dev/null "http://localhost:8081/index.bundle?platform=android&dev=true&hot=false" || {
  echo "Metro bundle request failed; last log lines:" >&2
  tail -30 /tmp/metro.log >&2
  exit 1
}

DRIVER="node ../../tools/visual-regression/run.mjs"

# Clean capture (SearchField stories, one theme is enough).
$DRIVER --stories searchfield --themes light_warmHarvest --out /tmp/dsvr-clean

# Reintroduce the #162 bug and recapture.
(cd "$REPO_ROOT" && git apply tools/visual-regression/sanity/searchfield-162.patch)
adb shell am force-stop dev.spudly.designsystem.storybook
$DRIVER --stories searchfield --themes light_warmHarvest --out /tmp/dsvr-mutated

# The job passes only if the comparison FAILS (exit 1).
if $DRIVER --from-dir /tmp/dsvr-mutated/actual --baselines /tmp/dsvr-clean/actual --out /tmp/dsvr-sanity-diff; then
  echo "::error::Sanity check failed: the #162 mutation produced NO screenshot diff — the pipeline is not sensitive to the bug."
  exit 1
fi
echo "Sanity check passed: the #162 mutation changed the SearchField screenshot on Android."
