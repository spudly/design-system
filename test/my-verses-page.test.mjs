/**
 * Contract test for MyVersesPage (spudly/design-system#49), the
 * design-system port of Memorize's Verses tab (VersesScreen in
 * spudly/memorize packages/app) — the app's home screen.
 *
 * The app screen is a fragment rendered inside the app shell's
 * non-scrolling ScreenContainer, and this page carries that
 * structure:
 * 1. The shell is the non-scrolling ScreenContainer (the app
 *    renders every tab inside <ScreenContainer scrollable=
 *    {false}>; its "Memorize" title and tab bar stay app-side).
 * 2. The FlatList is height-bounded with `flex: 1` (#188), the
 *    geometry the app's list uses in the same shell.
 * 3. The empty branch keys off the list being empty and carries
 *    the app's empty state verbatim; there is no loading state
 *    (the app gates on store readiness before any tab renders).
 * 4. Rows mirror the app card: reference, a status badge whose
 *    text is the status and whose tone follows the app's rule
 *    (memorized → success, learning → info), the verse text, an
 *    optional pre-composed next-review line, and the Drill /
 *    Remove pair reporting the verse id.
 * 5. No render slot: the file declares no ReactNode prop and no
 *    accessory — the app screen renders no app-owned content
 *    inside itself, so every action is a pure callback. No app
 *    package is imported.
 * 6. The stories render the real component in its two states
 *    (Default, Empty) in the Quiet Dawn theme.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/shared-with-me-page.test.mjs: the failures it guards
 * happen in native layout, which no JS renderer in this repo
 * performs, and the invariant is a per-literal property of the
 * source. Comments are stripped before scanning so prose cannot
 * satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "MyVersesPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "MyVersesPage.stories.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// (this file's subject is heavily commented) cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MyVersesPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full MyVersesPage source");
  assert.match(code, /export function MyVersesPage/);
});

test("no app imports: every import is react-native, tamagui, or a DS component", () => {
  const specifiers = [...code.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(specifiers.length > 0, "expected import specifiers to scan");
  for (const specifier of specifiers) {
    assert.ok(
      specifier === "react-native" ||
        specifier === "tamagui" ||
        specifier.startsWith("../components/"),
      `MyVersesPage must not import "${specifier}" — app logic stays app-side`,
    );
  }
});

test("the shell is the non-scrolling ScreenContainer", () => {
  assert.match(
    code,
    /<ScreenContainer\s+scrollable=\{false\}>/,
    "MyVersesPage must render <ScreenContainer scrollable={false}>, the app shell's container",
  );
});

test("the heading is the app screen's own heading", () => {
  assert.match(
    code,
    /<Text variant="heading">My verses<\/Text>/,
    'the view must render the "My verses" heading (the app\'s "Memorize" title stays app-side)',
  );
});

test("the FlatList is height-bounded with flex: 1 (#188)", () => {
  assert.match(
    code,
    /const listStyle = \{ flex: 1 \} as const;/,
    "the listStyle constant must be exactly { flex: 1 }",
  );
  assert.match(
    code,
    /<FlatList\s+style=\{listStyle\}/,
    "the FlatList must take style={listStyle} so the shell bounds its height",
  );
});

test("the empty branch keys off the empty list and carries the app's empty state verbatim", () => {
  assert.match(
    code,
    /verses\.length === 0 \?/,
    "the empty branch must key off the verse list being empty, as the app's does",
  );
  assert.ok(
    code.includes('title="No verses yet"'),
    "the empty state's title must be the app's, verbatim",
  );
  assert.ok(
    code.includes('body="Find one in the Search tab to get started."'),
    "the empty state's body must be the app's, verbatim",
  );
});

test("there is no loading state: no spinner, no state union", () => {
  assert.ok(
    !code.includes("Spinner"),
    "MyVersesPage must not render a Spinner — the app gates on store readiness before the tab renders",
  );
  assert.ok(
    !code.includes('"loading"'),
    "MyVersesPage must not declare a loading state member — this screen has none in the app",
  );
});

test("the status type mirrors the app's VerseStatus exactly", () => {
  assert.match(
    code,
    /export type MyVersesPageStatus = "learning" \| "memorized";/,
    "the status union must be the app's two statuses (packages/types VerseStatus)",
  );
});

test("the badge text is the status and its tone follows the app's rule", () => {
  assert.match(
    code,
    /tone=\{item\.status === "memorized" \? "success" : "info"\}/,
    "memorized must map to the success tone and learning to info, as the app renders it",
  );
  assert.ok(
    code.includes(">{item.status}</Badge>"),
    "the badge's text must be the status itself, as the app renders it",
  );
});

test("the next-review line renders only when the app composed one", () => {
  assert.match(
    code,
    /item\.nextReviewLabel \? <Text variant="hint">\{item\.nextReviewLabel\}<\/Text> : null/,
    "the hint line must render the pre-composed label and nothing when it is absent",
  );
});

test("row actions are bare intents reporting the verse id", () => {
  assert.match(code, /onDrillVerse\(item\.id\)/, "Drill must fire onDrillVerse with the verse id");
  assert.match(
    code,
    /onRemoveVerse\(item\.id\)/,
    "Remove must fire onRemoveVerse with the verse id",
  );
  assert.match(
    code,
    /<Button size="sm" onPress=\{onDrillPress\}>\s*Drill\s*<\/Button>/,
    "the Drill button must mirror the app's (small, primary)",
  );
  assert.match(
    code,
    /<Button size="sm" variant="secondary" onPress=\{onRemovePress\}>\s*Remove\s*<\/Button>/,
    "the Remove button must mirror the app's (small, secondary)",
  );
});

test("no render slot: no ReactNode prop, no accessory", () => {
  for (const banned of ["ReactNode", "Accessory", "slot"]) {
    assert.ok(
      !code.includes(banned),
      `MyVersesPage must not contain "${banned}" — the app screen renders no app-owned content inside itself, so the contract is callbacks only`,
    );
  }
});

test("stories render the real component in its two states, in Quiet Dawn", () => {
  for (const story of ["Default", "Empty"]) {
    assert.ok(
      new RegExp(String.raw`export const ${story}\b`).test(stories),
      `MyVersesPage.stories.tsx must export a ${story} story`,
    );
  }
  assert.match(
    stories,
    /title: "Pages\/Memorize\/MyVersesPage"/,
    "the stories must declare the Pages/Memorize/MyVersesPage title (#70)",
  );
  assert.match(
    stories,
    /theme: "light_quietDawn"/,
    "the stories must pin the Quiet Dawn theme (Memorize's brand)",
  );
});
