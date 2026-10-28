#!/usr/bin/env bash
# Builds the release APK the VR capture scripts install (see
# capture-compare.sh for why it is a release build with an embedded
# bundle). Shared by the visual-regression and sanity jobs.
#
# Usage: build-apk.sh [--gradle-only]
#   --gradle-only  skip `expo prebuild` (the sanity job's rebuild
#                  after applying its patch).
#
# Speed flags, all passed as -P overrides because `expo prebuild`
# regenerates android/gradle.properties on every run:
#   - reactNativeArchitectures=x86_64: the CI emulator is x86_64, so
#     compiling the native code for armeabi-v7a/arm64-v8a/x86 as
#     well is pure waste.
#   - minify and PNG crunch off: release-only size optimizations the
#     screenshots do not depend on.
#
# In CI the workflow runs this in the background BEFORE the emulator
# boots (so the two overlap) and records the outcome in
# $DSVR_BUILD_STATUS; wait-for-build.sh blocks on that.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT/apps/storybook"

if [ "${1:-}" != "--gradle-only" ]; then
  npx expo prebuild --platform android --no-install
fi
(cd android && ./gradlew assembleRelease --console=plain -q \
  -PreactNativeArchitectures=x86_64 \
  -Pandroid.enableMinifyInReleaseBuilds=false \
  -Pandroid.enablePngCrunchInReleaseBuilds=false)
