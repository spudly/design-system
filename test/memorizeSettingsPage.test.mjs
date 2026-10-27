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
 * 2. The two cards mirror the app: "Scripture source" (hint
 *    verbatim, secure key field, Save / Clear pair) and "Google
 *    Drive sync" (hint composed around the folder name,
 *    Connect / Sync button, alerts, conflict pair).
 * 3. The key field is controlled (value + change callback);
 *    Save disables on a whitespace-only value, the app's rule,
 *    and Clear renders only when a key is saved.
 * 4. The sync button's label and intent follow connection
 *    state; Connect disables until the auth flow is ready or
 *    while syncing, Sync disables while syncing.
 * 5. Feedback mirrors the app: auth error as an error alert,
 *    sync message as info — warning during a conflict — and
 *    the conflict pair as two named callbacks (the sync
 *    directions are app vocabulary and do not cross).
 * 6. No loading member and no render slot: the app gates store
 *    readiness above the tab shell, and the screen renders no
 *    app-owned content inside itself. No app package is
 *    imported.
 * 7. The stories render the real component in its three states
 *    (Default, NoApiKeyDriveDisconnected, SyncConflict) in the
 *    Quiet Dawn theme.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/myVersesPage.test.mjs: the failures it guards happen
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
const pagesDir = join(here, "..", "src", "pages");
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

test("the two cards carry the app's titles", () => {
  assert.match(code, /<SectionCard title="Scripture source">/);
  assert.match(code, /<SectionCard title="Google Drive sync">/);
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

test("the sync hint composes around the raw folder name", () => {
  assert.ok(
    code.includes(
      "Syncs your verse list (never your API key) to memorize-data.json in the “{driveFolderName}",
    ),
    "the sync hint must be the app's sentence composed around the folder-name prop",
  );
  assert.ok(code.includes("Drive folder."), "the sync hint's close must be the app's, verbatim");
});

test("the sync button follows connection state, with the app's disabled rules", () => {
  assert.match(code, /driveConnected \? \(/, "the button must branch on connection state");
  assert.ok(code.includes("Sync with Drive"), "the connected button must carry the app's label");
  assert.ok(
    code.includes("Connect Google Drive"),
    "the disconnected button must carry the app's label",
  );
  assert.match(
    code,
    /disabled=\{!driveConnectReady \|\| isSyncing\}/,
    "Connect must disable until the auth flow is ready or while syncing, as in the app",
  );
  assert.match(
    code,
    /onPress=\{onSyncDrivePress\} disabled=\{isSyncing\}/,
    "Sync must disable while a sync runs",
  );
});

test("feedback renders as the app renders it", () => {
  assert.match(
    code,
    /driveError \? <Alert severity="error">\{driveError\}<\/Alert> : null/,
    "the auth error must render as an error alert",
  );
  assert.match(
    code,
    /severity=\{syncConflict \? "warning" : "info"\}/,
    "the sync message must be a warning during a conflict and info otherwise, as in the app",
  );
});

test("the conflict pair is two named callbacks, and sync directions never cross", () => {
  assert.match(code, /onPress=\{onKeepDevicePress\}/);
  assert.match(code, /onPress=\{onKeepDrivePress\}/);
  assert.ok(code.includes("Keep this device"), "the device button must carry the app's label");
  assert.ok(code.includes("Keep Drive"), "the Drive button must carry the app's label");
  for (const banned of ['"push"', '"pull"', "onResolveConflict"]) {
    assert.ok(
      !code.includes(banned),
      `MemorizeSettingsPage must not contain ${banned} — the sync directions are the app's business vocabulary`,
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

test("stories render the real component in its three states, in Quiet Dawn", () => {
  for (const story of ["Default", "NoApiKeyDriveDisconnected", "SyncConflict"]) {
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
