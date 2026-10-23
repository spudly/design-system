#!/usr/bin/env bash
# CI driver for the #162 sanity job (see capture-compare.sh for why
# this lives in a file instead of the workflow's script block, and
# why the app is built as a release APK with an embedded bundle).
#
# Captures the SearchField stories clean, applies
# tools/visual-regression/sanity/searchfield-162.patch (pre-fix text
# glyph with numeric lineHeight, clip-box hardening removed),
# rebuilds and reinstalls, recaptures, and succeeds ONLY if the
# comparison fails — i.e. the pipeline is sensitive to the bug on
# Android.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT/apps/storybook"

npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease --console=plain -q)
adb install -r android/app/build/outputs/apk/release/app-release.apk

adb shell wm density 320
adb shell settings put system font_scale 1.0
adb logcat -G 8M

DRIVER="node ../../tools/visual-regression/run.mjs"

# Clean capture (SearchField stories, one theme is enough).
$DRIVER --stories searchfield --themes light_warmHarvest --out /tmp/dsvr-clean

# Reintroduce the #162 bug, rebuild with it embedded, and recapture.
(cd "$REPO_ROOT" && git apply tools/visual-regression/sanity/searchfield-162.patch)
(cd android && ./gradlew assembleRelease --console=plain -q)
adb install -r android/app/build/outputs/apk/release/app-release.apk
$DRIVER --stories searchfield --themes light_warmHarvest --out /tmp/dsvr-mutated

# The job passes only if the comparison FAILS (exit 1).
if $DRIVER --from-dir /tmp/dsvr-mutated/actual --baselines /tmp/dsvr-clean/actual --out /tmp/dsvr-sanity-diff; then
  echo "::error::Sanity check failed: the #162 mutation produced NO screenshot diff — the pipeline is not sensitive to the bug."
  exit 1
fi
echo "Sanity check passed: the #162 mutation changed the SearchField screenshot on Android."
