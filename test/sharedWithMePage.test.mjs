/**
 * Contract test for SharedWithMePage (spudly/design-system#49),
 * the design-system port of Eciperay's Shared-with-me screen.
 *
 * The app's SharedWithMeView shares Recipes' filter bar, filter
 * state, and fixed `list` shell, so this page carries the same
 * structural contract the recipesPageBoundedList test pins for
 * RecipesPage:
 * 1. The shell is the non-scrolling `list` ScreenContainer.
 * 2. The FlatList is height-bounded with `flex: 1` (#188).
 * 3. The filter bar renders as the list's ListHeaderComponent,
 *    exactly once, with the SearchField and the status/sort
 *    SelectFields the #162 composition requires.
 * 4. While loading, the list stays mounted with empty data and
 *    the spinner is its empty state (the filter input keeps
 *    focus); pagination is the end-reached hook at threshold 0.4
 *    with a spinner footer while the next page loads.
 *
 * And the contract points where this screen differs from Recipes,
 * which are the whole reason it is a separate page component:
 * 5. The empty state carries the app's shared-with-me message,
 *    both sentences verbatim (EmptyState title + body).
 * 6. Rows are press-only: the press reports the row id, and the
 *    file declares no row actions and no accessory slot — no
 *    "Log cook", no Delete, no render-prop — because the app's
 *    shared recipe card has no actions and nothing app-rendered
 *    appears inside the view.
 * 7. The stories render the real component in its four states
 *    (Default, Filtered, Empty, Loading) for Chromatic.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/recipesPageBoundedList.test.mjs: the failures it
 * guards happen in native layout, which no JS renderer in this
 * repo performs, and the invariant is a per-literal property of
 * the source. Comments are stripped before scanning so prose
 * cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "SharedWithMePage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "SharedWithMePage.stories.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// (this file's subject is heavily commented) cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("SharedWithMePage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full SharedWithMePage source");
  assert.match(code, /export function SharedWithMePage/);
});

test("the shell is the non-scrolling list ScreenContainer", () => {
  assert.match(
    code,
    /<ScreenContainer\s+variant="list"\s+scrollable=\{false\}>/,
    'SharedWithMePage must render <ScreenContainer variant="list" scrollable={false}>',
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
  const barAt = code.indexOf("<SharedWithMeFiltersBar");
  assert.ok(headerAt !== -1, "the FlatList must receive a ListHeaderComponent");
  assert.ok(barAt > headerAt, "the filter bar must render inside the ListHeaderComponent");
  assert.equal(
    code.indexOf("<SharedWithMeFiltersBar"),
    code.lastIndexOf("<SharedWithMeFiltersBar"),
    "the filter bar must render exactly once (a second copy could pin above the list)",
  );
});

test("the filter bar carries the #162 composition: search plus the selects", () => {
  assert.match(
    code,
    /<SearchField[^>]*placeholder="Search recipes…"/,
    "the bar must render the DS SearchField with the app's placeholder",
  );
  for (const label of ["Status", "Sort by", "Order"]) {
    assert.ok(
      code.includes(`label="${label}"`),
      `the bar must render the ${label} SelectField, mirroring the app's filter bar`,
    );
  }
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

test("pagination is the end-reached hook with a next-page spinner footer", () => {
  assert.match(code, /onEndReached=\{onLoadMore\}/, "the list must wire onEndReached");
  assert.match(
    code,
    /onEndReachedThreshold=\{0\.4\}/,
    "the end-reached threshold must match the app screen (0.4)",
  );
  assert.match(
    code,
    /ListFooterComponent=\{\s*isFetchingNextPage \?/,
    "the footer spinner must render only while the next page loads",
  );
});

test("the empty state carries the app's shared-with-me message, verbatim", () => {
  assert.ok(
    code.includes('title="Recipes others share with you will appear here."'),
    "the empty state's title must be the first sentence of the app's empty message",
  );
  assert.ok(
    code.includes('body="Open a share link while signed in to save recipes to this list."'),
    "the empty state's body must be the second sentence of the app's empty message",
  );
});

test("rows are press-only: the press reports the id; no actions, no slot", () => {
  assert.match(
    code,
    /onRecipePress\(item\.id\)/,
    "the row press must fire onRecipePress with the row id",
  );
  for (const banned of ["Log cook", "Delete", "renderRecipeAccessory", "onRecipeDelete"]) {
    assert.ok(
      !code.includes(banned),
      `SharedWithMePage must not contain "${banned}" — the app's shared recipe card has no row actions and no app-rendered row content`,
    );
  }
});

test("both row press targets are named buttons for screen readers", () => {
  assert.equal(
    code.split('accessibilityRole="button"').length - 1,
    2,
    "the thumbnail and text press targets must each declare the button role",
  );
  assert.equal(
    code.split("accessibilityLabel={item.title}").length - 1,
    2,
    "each press target must take the recipe title as its accessible name (the thumbnail target wraps only an image)",
  );
});

test("optional props omitted leave rendering unchanged", () => {
  assert.match(
    code,
    /isFetchingNextPage = false/,
    "isFetchingNextPage must default to false so omitting it renders no footer",
  );
  assert.match(
    code,
    /subtitle\?: string;/,
    "the item subtitle must stay optional (rows without one render title-only)",
  );
});

test("stories render the real component in its four states", () => {
  for (const story of ["Default", "Filtered", "Empty", "Loading"]) {
    assert.ok(
      new RegExp(String.raw`export const ${story}\b`).test(stories),
      `SharedWithMePage.stories.tsx must export a ${story} story`,
    );
  }
  assert.match(
    stories,
    /title: "Pages\/Eciperay\/SharedWithMePage"/,
    "the stories must declare the Pages/Eciperay/SharedWithMePage title (#70)",
  );
});
