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
 * 2. The page renders one card, "Scripture source" (hint
 *    verbatim, secure key field, Save / Clear pair). The
 *    "Google Drive sync" card was removed entirely in #424
 *    (Stephen removed Drive sync from Memorize, memorize#96):
 *    no Drive props, no Drive card, no Drive copy may return.
 * 3. The key field is controlled (value + change callback);
 *    Save disables on a whitespace-only value, the app's rule,
 *    and Clear renders only when a key is saved.
 * 4. No loading member and no render slot: the app gates store
 *    readiness above the tab shell, and the screen renders no
 *    app-owned content inside itself. No app package is
 *    imported.
 * 5. The stories render the real component in its two states
 *    (Default, NoApiKey) in the Quiet Dawn theme.
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
  assert.ok(code.length > 1000, "expected the full MemorizeSettingsPage source");
  assert.match(code, /export function MemorizeSettingsPage/);
});

test("no app imports: every import is tamagui or a DS component", () => {
  const specifiers = [...code.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(specifiers.length > 0, "expected import specifiers to scan");
  for (const specifier of specifiers) {
    assert.ok(
      specifier === "tamagui" || specifier.startsWith("../components/"),
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

test("the one card carries the app's title", () => {
  assert.match(code, /<SectionCard title="Scripture source">/);
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

test("the scripture-source hint is the app's, verbatim", () => {
  assert.ok(
    code.includes("A gospel-engine API key unlocks full-library search. The key stays on this"),
    "the hint's first line must be the app's, verbatim",
  );
  assert.ok(code.includes("never synced."), "the hint's closing words must be the app's, verbatim");
});

test("the key field is controlled and secure, as in the app", () => {
  assert.match(code, /label="API key"/);
  assert.match(code, /value=\{apiKeyValue\}/, "the field must take the controlled value prop");
  assert.match(
    code,
    /onChangeText=\{onApiKeyValueChange\}/,
    "the field must report changes through the callback prop",
  );
  assert.match(code, /placeholder="gospel-engine API key"/);
  assert.match(code, /secureTextEntry/);
  assert.match(code, /autoCapitalize="none"/);
});

test("Save disables on a whitespace-only value and Clear keys off the saved key", () => {
  assert.match(
    code,
    /disabled=\{!apiKeyValue\.trim\(\)\}/,
    "Save must disable when the trimmed field value is empty, the app's rule",
  );
  assert.ok(code.includes("Save key"), "the save button must carry the app's label");
  assert.match(
    code,
    /hasSavedApiKey \? \(/,
    "Clear must render only when a key is saved, as in the app",
  );
  assert.ok(code.includes("Clear key"), "the clear button must carry the app's label");
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

test("stories render the real component in its two states, in Quiet Dawn", () => {
  for (const story of ["Default", "NoApiKey"]) {
    assert.ok(
      new RegExp(String.raw`export const ${story}\b`).test(stories),
      `MemorizeSettingsPage.stories.tsx must export a ${story} story`,
    );
  }
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
