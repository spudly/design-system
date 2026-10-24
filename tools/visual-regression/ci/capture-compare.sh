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
# Usage: capture-compare.sh [compare|update]
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

if [ "$MODE" = "update" ]; then
  node ../../tools/visual-regression/run.mjs --update --out /tmp/dsvr-out
else
  node ../../tools/visual-regression/run.mjs --out /tmp/dsvr-out
fi
