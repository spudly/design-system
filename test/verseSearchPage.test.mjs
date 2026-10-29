/**
 * Contract test for VerseSearchPage (spudly/design-system#49),
 * the design-system port of Memorize's Search tab (SearchScreen
 * in spudly/memorize packages/app).
 *
 * The app screen is a fragment rendered inside the app shell's
 * non-scrolling ScreenContainer, and this page carries that
 * structure:
 * 1. The shell is the non-scrolling ScreenContainer (the app
 *    renders every tab inside <ScreenContainer scrollable=
 *    {false}>; its "Memorize" title and tab bar stay app-side).
 * 2. The results list is the shared BoundedList, height-bounded
 *    with `flex: 1` (#188 — the bounding is BoundedList's own
 *    since the #119 fix) and stays mounted across searches — a
 *    re-search never blanks the previous results; the busy
 *    spinner renders above it.
 * 3. The demo-mode notice carries the app's text verbatim and
 *    renders above the search row; the error alert carries the
 *    app-composed message.
 * 4. The search row mirrors the app: the DS SearchField with the
 *    app's placeholder (its keyword example mode-aware, #276),
 *    submit-editing and the Search button
 *    firing the same callback, and the button's disabled rule
 *    (searching, or a blank query).
 * 5. There is deliberately NO empty state: the app renders an
 *    empty list before the first search and after a fruitless
 *    one. The absence is pinned — inventing one would repeat
 *    the #44 demo failure mode.
 * 6. Result rows mirror the app card and the add action reports
 *    the verse id. No render slot: no ReactNode prop, no
 *    accessory — the app screen renders no app-owned content
 *    inside itself. No app package is imported.
 * 7. The stories render the real component in its five states
 *    (Default, DemoMode, Searching, Error, NoResults) in the
 *    Quiet Dawn theme.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/recipesPageSharedConfig.test.mjs: the failures it guards
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
const source = readFileSync(join(pagesDir, "VerseSearchPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "VerseSearchPage.stories.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// (this file's subject is heavily commented) cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("VerseSearchPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full VerseSearchPage source");
  assert.match(code, /export function VerseSearchPage/);
});

test("no app imports: every import is react-native, tamagui, a DS component, or the internal BoundedList", () => {
  const specifiers = [...code.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(specifiers.length > 0, "expected import specifiers to scan");
  for (const specifier of specifiers) {
    assert.ok(
      specifier === "react-native" ||
        specifier === "tamagui" ||
        specifier.startsWith("../components/") ||
        // Internal page scaffolding (the PageFrame pattern): the
        // shared bounded list lives with the pages because it
        // imports react-native (#119).
        specifier === "./BoundedList.js",
      `VerseSearchPage must not import "${specifier}" — app logic stays app-side`,
    );
  }
});

test("the shell is the non-scrolling ScreenContainer", () => {
  assert.match(
    code,
    /<ScreenContainer\s+scrollable=\{false\}>/,
    "VerseSearchPage must render <ScreenContainer scrollable={false}>, the app shell's container",
  );
});

test("the heading is the app screen's own heading", () => {
  assert.match(
    code,
    /<Text variant="heading">Search verses<\/Text>/,
    'the view must render the "Search verses" heading (the app\'s "Memorize" title stays app-side)',
  );
});

test("the demo-mode notice carries the app's text verbatim, above the search row", () => {
  assert.match(
    code,
    /\{usingDemo \? \(/,
    "the demo notice must render only when the app reports demo mode",
  );
  assert.match(
    code,
    /Searching the built-in demo set\. Add a gospel-engine API key in Settings for full-library\s+search\./,
    "the demo notice text must be the app's, verbatim",
  );
  assert.ok(
    code.indexOf("Searching the built-in demo set") < code.indexOf("<SearchField"),
    "the demo notice must render above the search row, as in the app",
  );
});

test("the search row wires the field and the button to the one search callback", () => {
  assert.match(
    code,
    /<SearchField\s+value=\{query\}\s+onChangeText=\{onQueryChange\}/,
    "the SearchField must be controlled by the query props",
  );
  assert.match(
    code,
    /placeholder=\{\s*usingDemo \?/,
    "the placeholder's keyword example must be selected by usingDemo (#276)",
  );
  assert.match(
    code,
    /usingDemo \? "e\.g\. Ether 12:27 or “weakness”" : "e\.g\. Ether 12:27 or “charity”"/,
    'the ternary must map demo mode to the "weakness" placeholder (the demo set answers it with Ether 12:27 and contains no "charity" verse) and full-library mode to the "charity" placeholder, verbatim (#276)',
  );
  assert.match(
    code,
    /onSubmitEditing=\{onSearch\}/,
    "submitting the field must fire onSearch, as the app's submit invokes its search routine",
  );
  assert.match(
    code,
    /<Button onPress=\{onSearch\} disabled=\{isSearching \|\| query\.trim\(\) === ""\}>\s*Search\s*<\/Button>/,
    "the Search button must fire onSearch and follow the app's disabled rule (searching or a blank query)",
  );
});

test("the error alert carries the app-composed message", () => {
  assert.match(
    code,
    /\{errorMessage \? <Alert severity="error">\{errorMessage\}<\/Alert> : null\}/,
    "a non-null errorMessage must render as the error alert, verbatim",
  );
});

test("the busy spinner renders above a results list that stays mounted", () => {
  assert.match(
    code,
    /\{isSearching \? <Spinner label="Loading" \/> : null\}/,
    "the spinner must render while a search is in flight",
  );
  assert.match(
    code,
    /data=\{results\}/,
    "the list data must be the results as-is — no swap or blanking while searching",
  );
  assert.ok(
    code.indexOf("<Spinner") < code.indexOf("<BoundedList"),
    "the spinner must render above the list, as in the app",
  );
});

test("the list is the shared BoundedList; the page carries no styling of its own (#119)", () => {
  assert.match(
    code,
    /<BoundedList\s+data=\{results\}/,
    "the results must render through BoundedList, which owns the #188 flex: 1 bounding and row separation",
  );
  for (const banned of ["FlatList", "listStyle", "XStack", "YStack", "marginBottom", "style={"]) {
    assert.ok(
      !code.includes(banned),
      `VerseSearchPage must not contain "${banned}" — list bounding, row layout, and card spacing live in BoundedList / Row / SearchField since the #119 fix`,
    );
  }
});

test("there is deliberately no empty state on this screen", () => {
  assert.ok(
    !code.includes("EmptyState"),
    "VerseSearchPage must not render an EmptyState — the app renders an empty list before the first search and after a fruitless one",
  );
  assert.ok(
    !code.includes("No results"),
    "VerseSearchPage must not invent a no-results message — the app has none on this screen",
  );
});

test("result rows mirror the app card and the add action reports the verse id", () => {
  assert.match(
    code,
    /onAddVerse\(item\.id\)/,
    "the add action must fire onAddVerse with the verse id",
  );
  assert.match(
    code,
    /<Button size="sm" onPress=\{onAddPress\}>\s*Add to memorize list\s*<\/Button>/,
    'the row button must be the app\'s small "Add to memorize list" button',
  );
});

test("an added result renders the disabled Added confirmation, not the Add button (#242)", () => {
  assert.match(
    code,
    /added\?: boolean;/,
    "VerseSearchPageItem must carry the optional added flag (#242)",
  );
  assert.match(
    code,
    /\{item\.added \? \(\s*<Button size="sm" variant="secondary" disabled>\s*Added\s*<\/Button>/,
    'an added result must render the disabled secondary "Added" button (mirroring the memorize web fix)',
  );
});

test("no render slot: no ReactNode prop, no accessory", () => {
  for (const banned of ["ReactNode", "Accessory", "slot"]) {
    assert.ok(
      !code.includes(banned),
      `VerseSearchPage must not contain "${banned}" — the app screen renders no app-owned content inside itself, so the contract is callbacks only`,
    );
  }
});

test("stories render the real component in its six states, in Quiet Dawn", () => {
  for (const story of [
    "Default",
    "DemoMode",
    "Searching",
    "Error",
    "NoResults",
    "WithAddedResult",
  ]) {
    assert.ok(
      new RegExp(String.raw`export const ${story}\b`).test(stories),
      `VerseSearchPage.stories.tsx must export a ${story} story`,
    );
  }
  assert.match(
    stories,
    /title: "Pages\/Memorize\/VerseSearchPage"/,
    "the stories must declare the Pages/Memorize/VerseSearchPage title (#70)",
  );
  assert.match(
    stories,
    /theme: "light_quietDawn"/,
    "the stories must pin the Quiet Dawn theme (Memorize's brand)",
  );
});
