/**
 * Regression test for spudly/eciperay#188 (Android: the Recipes
 * screen is not scrollable — the filter form fills the viewport and
 * the recipe list below it is unreachable).
 *
 * The app's diagnosis, verified against its layout: the screen is a
 * fixed `list` shell (by design it does not scroll), and the
 * FlatList inside it carried no height bound, so it sized to its
 * full content height, overflowed the viewport, and never received
 * a scrollable viewport of its own. Pinning the filters above the
 * bounded list was not a fix either: the filter form is nearly a
 * viewport tall on its own, so the list got only a sliver.
 *
 * RecipesPage (#49) is the design-system port of that screen, and
 * its structure is the contract this test guards in source:
 * 1. The shell is the non-scrolling `list` ScreenContainer
 *    (`variant="list"`, `scrollable={false}`).
 * 2. The FlatList is height-bounded with `flex: 1` (the listStyle
 *    constant) so the shell hands it exactly the leftover viewport.
 * 3. The filter bar renders as the list's ListHeaderComponent, so
 *    filters and recipes scroll together.
 * 4. While loading, the list stays mounted with empty data
 *    (`data={isLoading ? [] : recipes}`) — unmounting it would drop
 *    the focused filter input mid-typing; the spinner is the list's
 *    empty state instead.
 *
 * This is a source scan, not a render test: the failure happens in
 * Android's Yoga layout, which no JS renderer in this repo performs,
 * and the invariant is a per-literal property of the source (same
 * rationale as test/glyphLineHeight.test.mjs). Comments are
 * stripped before scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "pages", "RecipesPage.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// (this file's subject is heavily commented) cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipesPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full RecipesPage source");
  assert.match(code, /export function RecipesPage/);
});

test("the shell is the non-scrolling list ScreenContainer", () => {
  assert.match(
    code,
    /<ScreenContainer\s+variant="list"\s+scrollable=\{false\}>/,
    'RecipesPage must render <ScreenContainer variant="list" scrollable={false}>',
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

test("the filter bar renders as the list header, not a pinned sibling (#188)", () => {
  const headerAt = code.indexOf("ListHeaderComponent");
  const barAt = code.indexOf("<RecipesFiltersBar");
  assert.ok(headerAt !== -1, "the FlatList must receive a ListHeaderComponent");
  assert.ok(barAt > headerAt, "the filter bar must render inside the ListHeaderComponent");
  assert.equal(
    code.indexOf("<RecipesFiltersBar"),
    code.lastIndexOf("<RecipesFiltersBar"),
    "the filter bar must render exactly once (a second copy could pin above the list)",
  );
});

test("the list stays mounted while loading (#188 focus contract)", () => {
  assert.match(
    code,
    /data=\{isLoading \? \[\] : recipes\}/,
    "loading must empty the data, not swap the tree, so the filter input keeps focus",
  );
  assert.match(
    code,
    /ListEmptyComponent=\{\s*isLoading \?/,
    "the loading spinner must render as the list's empty state",
  );
});
