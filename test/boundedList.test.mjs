/**
 * Contract test for BoundedList (spudly/design-system#119), the
 * shared bounded FlatList the fixed-shell list pages render.
 *
 * BoundedList is the list half of the #119 page-fix program: it
 * owns the two pieces of list styling the pages used to apply
 * themselves, so the pages can drop them entirely —
 * 1. The #188 bounding: `flex: 1` on the FlatList, exactly. A
 *    list that sizes to its content inside a non-scrolling shell
 *    overflows the viewport and never scrolls; the bounding must
 *    land on the FlatList itself.
 * 2. Row separation: a separator of the spacing scale's step 2
 *    (8px) between rows, rendered by the list — the separation
 *    the row cards' bottom margin used to provide.
 *
 * It lives in src/pages as internal scaffolding (the PageFrame
 * pattern): it imports react-native, which no root-exported
 * component may do (the package root is imported in plain Node),
 * and it is NOT exported from src/pages/index.ts — the pages
 * that use it import it directly. Those placements are pinned
 * here and in test/storybookParity.test.mjs.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/verseSearchPage.test.mjs: the failures it guards
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
const source = readFileSync(join(pagesDir, "BoundedList.tsx"), "utf8");
const pagesIndex = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("BoundedList source is readable and non-trivial", () => {
  assert.ok(code.length > 500, "expected the full BoundedList source");
  assert.match(code, /export function BoundedList/);
});

test("the FlatList is height-bounded with flex: 1, exactly (#188)", () => {
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

test("row separation is the spacing scale's step 2, rendered by the list itself", () => {
  assert.match(
    code,
    /const separatorStyle = \{ height: tokens\.spacing\[2\] \} as const;/,
    "the separator must be exactly the spacing scale's step 2 (8px), the separation the row cards' marginBottom $2 used to give",
  );
  assert.match(
    code,
    /ItemSeparatorComponent=\{separator === "none" \? undefined : separators\[separator\]\}/,
    "the list must render the separator itself, so rows carry no spacing props",
  );
  assert.match(
    code,
    /const separators = \{ sm: BoundedListSeparator, md: BoundedListSeparatorMd \} as const;/,
    "the default separator stays BoundedListSeparator; md is the only other rhythm",
  );
  assert.match(
    code,
    /separator = "sm"/,
    "the separator defaults to sm, so existing consumers render unchanged",
  );
});

test("the catalog slots and handlers are optional and passed through only when given", () => {
  for (const prop of [
    "ListHeaderComponent",
    "ListEmptyComponent",
    "ListFooterComponent",
    "onEndReached",
    "onEndReachedThreshold",
    "onScroll",
    "keyboardShouldPersistTaps",
  ]) {
    assert.match(
      code,
      new RegExp(String.raw`\.\.\.\(${prop} !== undefined \? \{ ${prop} \} : null\)`),
      `${prop} must reach the FlatList only when the caller provides it`,
    );
  }
  assert.match(
    code,
    /const pageContentStyle = \{\s+paddingHorizontal: tokens\.spacing\[4\],\s+paddingBottom: tokens\.spacing\[8\],\s+\} as const;/,
    "the page content inset is the standard page geometry both catalog lists used",
  );
  assert.match(
    code,
    /\.\.\.\(contentInset === "page" \? \{ contentContainerStyle: pageContentStyle \} : null\)/,
    "the content inset applies only when the caller asks for the page geometry",
  );
  assert.match(code, /contentInset = "none"/, "the content inset defaults to none");
});

test("the API mirrors the FlatList props the pages use — data, keyExtractor, renderItem", () => {
  assert.match(code, /data: readonly Item\[\];/);
  assert.match(code, /keyExtractor: \(item: Item, index: number\) => string;/);
  assert.match(code, /renderItem: ListRenderItem<Item>;/);
  assert.match(code, /data=\{data\}/);
  assert.match(code, /keyExtractor=\{keyExtractor\}/);
  assert.match(code, /renderItem=\{renderItem\}/);
});

test("BoundedList is internal: not exported from the pages index", () => {
  assert.ok(
    !pagesIndex.includes("BoundedList"),
    "BoundedList must not be exported from src/pages/index.ts — it is internal page scaffolding (the PageFrame pattern)",
  );
});

test("the three fixed-shell list pages render BoundedList", () => {
  for (const page of ["VerseSearchPage", "MemorizeReviewPage", "MyVersesPage"]) {
    const pageSource = readFileSync(join(pagesDir, `${page}.tsx`), "utf8");
    assert.match(
      pageSource,
      /import \{ BoundedList \} from "\.\/BoundedList\.js";/,
      `${page} must import BoundedList from the internal module`,
    );
    assert.match(pageSource, /<BoundedList/, `${page} must render BoundedList`);
  }
});

test("the loading slot helpers render the catalog spinner compositions (#119)", () => {
  assert.match(code, /export function BoundedListLoading\(\)/);
  assert.match(code, /export function BoundedListLoadingMore\(\)/);
  assert.match(code, /<Spinner label="Loading" \/>/);
  assert.match(
    code,
    /paddingBlockStart="\$8"/,
    "the empty-state spinner sits below the header's height, as the catalog pages composed it",
  );
});

test("RecipesPage renders its loading slots through the helpers (#119)", () => {
  const page = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
  assert.match(page, /isLoading \? \(\s*<BoundedListLoading \/>/);
  assert.match(page, /isFetchingNextPage \? <BoundedListLoadingMore \/> : undefined/);
});
