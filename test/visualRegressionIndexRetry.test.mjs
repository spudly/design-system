/**
 * Unit tests for the story-index read in tools/visualRegression
 * (issue #352): parseStoryIndex (the logcat parse) and
 * launchAndReadStoryIndex's bounded relaunch.
 *
 * The launch tests run the real helper against a fake `adb` shim
 * on PATH: the shim stays silent on the first launch (the
 * emulator app-process death the issue observed) and logs the
 * index on the second, which is exactly the field failure the
 * relaunch exists to absorb. A shim that never logs the index
 * proves the helper still gives up (returns null) after the one
 * relaunch — the retry is bounded, not a loop.
 */
import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import process from "node:process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const toolsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "tools", "visualRegression");
const { parseStoryIndex, launchAndReadStoryIndex } = await import(join(toolsDir, "device.mjs"));

test("parseStoryIndex extracts story ids in order", () => {
  const logs = [
    "DSVR INDEX_BEGIN 2",
    "DSVR INDEX_ITEM pages-eciperay-homepage--empty",
    "some unrelated logcat noise",
    "DSVR INDEX_ITEM pages-eciperay-homepage--loading",
    "DSVR INDEX_END",
  ].join("\n");
  assert.deepEqual(parseStoryIndex(logs), [
    { id: "pages-eciperay-homepage--empty" },
    { id: "pages-eciperay-homepage--loading" },
  ]);
});

test("parseStoryIndex dedupes a repeated boot log, first occurrence wins", () => {
  const logs = [
    "DSVR INDEX_ITEM pages-eciperay-recipespage--default",
    "DSVR INDEX_ITEM pages-eciperay-recipespage--empty",
    "DSVR INDEX_ITEM pages-eciperay-recipespage--default",
  ].join("\n");
  assert.deepEqual(parseStoryIndex(logs), [
    { id: "pages-eciperay-recipespage--default" },
    { id: "pages-eciperay-recipespage--empty" },
  ]);
});

test("parseStoryIndex returns an empty list when the index never logged", () => {
  assert.deepEqual(parseStoryIndex("ReactNativeJS: something else entirely"), []);
});

// A fake adb: counts `am start` launches in $DSVR_FAKE_ADB_STATE;
// `logcat -d` prints the story index only once the launch count
// reaches $DSVR_FAKE_ADB_INDEX_ON_LAUNCH (0 = never).
const FAKE_ADB = `#!/bin/sh
state="$DSVR_FAKE_ADB_STATE"
if [ "$1" = "shell" ] && [ "$2" = "am" ] && [ "$3" = "start" ]; then
  n=0
  [ -f "$state" ] && n=$(cat "$state")
  n=$((n + 1))
  printf '%s' "$n" > "$state"
  exit 0
fi
if [ "$1" = "logcat" ] && [ "$2" = "-d" ]; then
  n=0
  [ -f "$state" ] && n=$(cat "$state")
  if [ "$DSVR_FAKE_ADB_INDEX_ON_LAUNCH" != "0" ] && [ "$n" -ge "$DSVR_FAKE_ADB_INDEX_ON_LAUNCH" ]; then
    echo "DSVR INDEX_BEGIN 1"
    echo "DSVR INDEX_ITEM pages-eciperay-recipespage--default"
    echo "DSVR INDEX_END"
  fi
  exit 0
fi
exit 0
`;

function installFakeAdb(indexOnLaunch) {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-fake-adb-"));
  const shim = join(dir, "adb");
  writeFileSync(shim, FAKE_ADB);
  chmodSync(shim, 0o755);
  const saved = {
    PATH: process.env.PATH,
    state: process.env.DSVR_FAKE_ADB_STATE,
    onLaunch: process.env.DSVR_FAKE_ADB_INDEX_ON_LAUNCH,
  };
  process.env.PATH = `${dir}:${saved.PATH}`;
  process.env.DSVR_FAKE_ADB_STATE = join(dir, "launches");
  process.env.DSVR_FAKE_ADB_INDEX_ON_LAUNCH = String(indexOnLaunch);
  return () => {
    process.env.PATH = saved.PATH;
    if (saved.state === undefined) delete process.env.DSVR_FAKE_ADB_STATE;
    else process.env.DSVR_FAKE_ADB_STATE = saved.state;
    if (saved.onLaunch === undefined) delete process.env.DSVR_FAKE_ADB_INDEX_ON_LAUNCH;
    else process.env.DSVR_FAKE_ADB_INDEX_ON_LAUNCH = saved.onLaunch;
  };
}

const CONFIG = { packageName: "dev.spudly.designsystem.storybook", indexTimeoutMs: 1500 };

test("launchAndReadStoryIndex relaunches once when the first launch never logs its index", async () => {
  const restore = installFakeAdb(2);
  try {
    const stories = await launchAndReadStoryIndex(CONFIG);
    assert.deepEqual(stories, [{ id: "pages-eciperay-recipespage--default" }]);
  } finally {
    restore();
  }
});

test("launchAndReadStoryIndex returns the index from a healthy first launch", async () => {
  const restore = installFakeAdb(1);
  try {
    const stories = await launchAndReadStoryIndex(CONFIG);
    assert.deepEqual(stories, [{ id: "pages-eciperay-recipespage--default" }]);
  } finally {
    restore();
  }
});

test("launchAndReadStoryIndex gives up after the one relaunch when the index never arrives", async () => {
  const restore = installFakeAdb(0);
  try {
    const stories = await launchAndReadStoryIndex(CONFIG);
    assert.equal(stories, null);
  } finally {
    restore();
  }
});
