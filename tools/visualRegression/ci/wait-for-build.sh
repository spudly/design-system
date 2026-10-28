#!/usr/bin/env bash
# Blocks until the background build started by the workflow's
# "Start APK build" step finishes, replays its log, and fails if the
# build failed. If no background build was started (a manual run on
# a dev machine), builds in the foreground instead.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
STATUS="${DSVR_BUILD_STATUS:-/tmp/dsvr-build.status}"
LOG="${DSVR_BUILD_LOG:-/tmp/dsvr-build.log}"

if [ ! -f "$LOG" ]; then
  exec bash "$DIR/build-apk.sh"
fi

# Bounded wait; the job timeout is the real backstop.
for _ in $(seq 1 1800); do
  [ -f "$STATUS" ] && break
  sleep 2
done
cat "$LOG"
if [ ! -f "$STATUS" ] || [ "$(cat "$STATUS")" != "0" ]; then
  echo "::error::Background APK build failed or timed out (status: $(cat "$STATUS" 2>/dev/null || echo none))."
  exit 1
fi
