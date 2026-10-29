/**
 * RecipesPage list geometry (#188): the page's recipe list must
 * fill the viewport height below the fixed shell's header area.
 * The regression shipped because ScreenContainer's content box
 * could not establish a definite cross-size: Tamagui's YStack
 * defaults to alignItems "stretch", so a FlatList child rendered
 * at its content height and every list after the first screenful
 * was unreachable — no error, just silent truncation. The `list`
 * ScreenContainer variant and the shared BoundedList pattern pin
 * the fix.
 *
 * Since the #119 recipes-list tranche the page adopts BoundedList
 * itself (separator="none" — the rows space themselves, exactly
 * the pre-adoption structure; contentInset="page" — its 16px
 * sides / 32px bottom inset, identical to the pre-adoption
 * listContentStyle), so these pins run against the adoption and
 * the shared component. The other fixed-header pages (Discover,
 * MealtimeQueue) keep their own FlatList + listStyle composition;
 * their separator/inset pins live in discoverPage.test.mjs and
 * mealtimeQueuePage.test.mjs. Comments are stripped before
 * scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const code = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8")
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");

test("RecipesPage renders the fixed list shell, non-scrolling", () => {
  assert.match(
    code,
    /<ScreenContainer variant="list" scrollable=\{false\}>/,
    "RecipesPage must render ScreenContainer's list variant so the shell owns the fill",
  );
});

test("RecipesPage adopts BoundedList with its separator and inset (#119)", () => {
  assert.match(code, /import \{[\s\S]*?BoundedList[\s\S]*?\} from "\.\/BoundedList\.js";/);
  assert.match(code, /<BoundedList/);
  assert.match(
    code,
    /separator="none"/,
    "the rows space themselves (MediaRow's own padded wrapper) — no list separator, exactly the pre-adoption structure",
  );
  assert.match(
    code,
    /contentInset="page"/,
    "the page's 16px sides / 32px bottom inset is BoundedList's page inset",
  );
  assert.ok(
    !code.includes("FlatList"),
    "the page must not render its own list element — BoundedList owns it",
  );
  assert.ok(
    !code.includes("listStyle"),
    "the page must not carry the old listStyle constant — BoundedList owns the geometry",
  );
});

test("the list takes separating taps while the keyboard is open", () => {
  assert.match(
    code,
    /keyboardShouldPersistTaps="handled"/,
    "filter controls live in the list header — taps must land with the keyboard open",
  );
});

test("loading keeps the list mounted and shows the spinner as its empty state", () => {
  assert.match(
    code,
    /data=\{isLoading \? \[\] : recipes\}/,
    "loading empties the DATA, never the list — swapping the tree would unmount the focused filter input mid-typing",
  );
  assert.match(code, /<BoundedListLoading \/>/);
  assert.match(
    code,
    /ListHeaderComponent=\{\s*<RecipesFiltersBar/,
    "the filter bar renders once as the list header, so it scrolls with the recipes",
  );
});

test("rows render through MediaRow, standalone (no list-item wrapper)", () => {
  assert.match(code, /renderItem=\{\(\{ item \}\) => \{/);
  assert.match(code, /<MediaRow/);
  assert.ok(
    !code.includes('role="listitem"'),
    "rows must not be wrapped in a listitem element — each row is a standalone article",
  );
});

test("the list stories pin the bounded geometry (#188)", () => {
  assert.match(
    stories,
    /<View width=\{430\} maxWidth="100%" height=\{844\}>/,
    "the stories' Viewport bounds the list to a phone-height frame",
  );
  assert.match(stories, /export const Default/);
  assert.match(stories, /export const Empty/);
  assert.match(stories, /export const Loading/);
});
