/**
 * Contract test for MemorizeSettingsPage (spudly/design-system#127,
 * B4), the design-system port of Memorize's Settings tab
 * (SettingsScreen in spudly/memorize packages/app) — the last of
 * the app's screens to move; the other four render DS pages from
 * the #49 rewires.
 *
 * The app screen is a fragment rendered inside the app shell's
 * non-scrolling ScreenContainer, and this page carries that
 * structure:
 * 1. The shell is the non-scrolling ScreenContainer (the app
 *    renders every tab inside <ScreenContainer scrollable=
 *    {false}>; its "Memorize" title and tab bar stay app-side).
 * 2. The page renders no cards. The "Google Drive sync" card
 *    was removed entirely in #424 (Stephen removed Drive sync
 *    from Memorize, memorize#96): no Drive props, no Drive
 *    card, no Drive copy may return. The "Scripture source"
 *    card — the secure API-key field and its Save / Clear
 *    pair — was removed entirely in #439 (Stephen ruled
 *    Memorize search is server-key-only on every platform,
 *    memorize#101): no API-key props, no API-key card, no
 *    API-key copy may return.
 * 3. No loading member and no render slot: the app gates store
 *    readiness above the tab shell, and the screen renders no
 *    app-owned content inside itself. No app package is
 *    imported.
 * 4. The stories render the real component in its one state
 *    (Default) in the Quiet Dawn theme.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/myVersesPage.test.ts: the failures it guards happen
 * in native layout and prop wiring, which no JS renderer in
 * this repo performs, and the invariant is a per-literal
 * property of the source. Comments are stripped before
 * scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "../..", "src", "pages");
const source = readFileSync(join(pagesDir, "MemorizeSettingsPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "MemorizeSettingsPage.stories.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// (this file's subject is heavily commented) cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MemorizeSettingsPage source is readable and non-trivial", () => {
  assert.ok(code.length > 300, "expected the full MemorizeSettingsPage source");
  assert.match(code, /export function MemorizeSettingsPage/);
});

test("no app imports: every import is tamagui, a DS component, or a DS view", () => {
  const specifiers = [...code.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(specifiers.length > 0, "expected import specifiers to scan");
  for (const specifier of specifiers) {
    assert.ok(
      specifier === "tamagui" ||
        specifier.startsWith("../components/") ||
        specifier.startsWith("../views/"),
      `MemorizeSettingsPage must not import "${specifier}" — app logic stays app-side`,
    );
  }
});

test("the shell is the non-scrolling ScreenContainer", () => {
  assert.match(
    code,
    /<ScreenContainer\s+scrollable=\{false\}>/,
    "MemorizeSettingsPage must render <ScreenContainer scrollable={false}>, the app shell's container",
  );
});

test("the heading is the app screen's own heading", () => {
  assert.match(
    code,
    /<Text variant="heading">Settings<\/Text>/,
    'the view must render the "Settings" heading (the app\'s "Memorize" title stays app-side)',
  );
});

test("the Drive sync section is removed entirely (#424)", () => {
  for (const banned of [
    "Google Drive sync",
    "driveFolderName",
    "driveConnected",
    "driveConnectReady",
    "isSyncing",
    "driveError",
    "syncMessage",
    "syncConflict",
    "onConnectDrivePress",
    "onSyncDrivePress",
    "onKeepDevicePress",
    "onKeepDrivePress",
    "Connect Google Drive",
    "Sync with Drive",
    "Keep this device",
    "Keep Drive",
  ]) {
    assert.ok(
      !code.includes(banned),
      `MemorizeSettingsPage must not contain "${banned}" — Drive sync was removed from Memorize (#424)`,
    );
  }
});

test("the API key section is removed entirely (#439)", () => {
  for (const banned of [
    "Scripture source",
    "apiKeyValue",
    "onApiKeyValueChange",
    "hasSavedApiKey",
    "onSaveApiKeyPress",
    "onClearApiKeyPress",
    "API key",
    "gospel-engine API key",
    "A gospel-engine API key unlocks full-library search",
    "Save key",
    "Clear key",
    "secureTextEntry",
    "TextField",
    "SectionCard",
  ]) {
    assert.ok(
      !code.includes(banned),
      `MemorizeSettingsPage must not contain "${banned}" — the API key section was removed from Memorize settings (#439)`,
    );
  }
});

test("there is no loading member: no spinner, no state union", () => {
  assert.ok(
    !code.includes("Spinner"),
    "MemorizeSettingsPage must not render a Spinner — the app gates on store readiness before the tab renders",
  );
  assert.ok(
    !code.includes('"loading"'),
    "MemorizeSettingsPage must not declare a loading state member — this screen has none in the app",
  );
});

test("no render slot: no ReactNode prop, no accessory", () => {
  for (const banned of ["ReactNode", "Accessory", "slot"]) {
    assert.ok(
      !code.includes(banned),
      `MemorizeSettingsPage must not contain "${banned}" — the app screen renders no app-owned content inside itself, so the contract is callbacks only`,
    );
  }
});

test("stories render the real component in its one state, in Quiet Dawn", () => {
  assert.ok(
    /export const Default\b/.test(stories),
    "MemorizeSettingsPage.stories.tsx must export a Default story",
  );
  assert.ok(
    !/export const NoApiKey\b/.test(stories),
    "MemorizeSettingsPage.stories.tsx must not export a NoApiKey story — the API key section is removed (#439)",
  );
  assert.match(
    stories,
    /title: "Pages\/Memorize\/MemorizeSettingsPage"/,
    "the stories must declare the Pages/Memorize/MemorizeSettingsPage title (#70)",
  );
  assert.match(
    stories,
    /theme: "light_quietDawn"/,
    "the stories must pin the Quiet Dawn theme (Memorize's brand)",
  );
});
