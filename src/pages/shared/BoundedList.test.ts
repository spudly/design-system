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
 * pattern): it imports react-native and it is not a page, so
 * under the pages-only export contract (#298) it is NOT exported
 * from the pages barrel — the pages that use it import it
 * directly.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6b: BoundedList is called directly (with react-native
 * stubbed, per the tranche 6a pattern) and the FlatList element
 * it returns is inspected — its style, separator, and the props
 * it forwards — and the three fixed-shell list pages are called
 * and checked for the BoundedList element in their trees. The
 * built pages barrel (dist/pages/index.d.ts — a built-artifact
 * read, not a source read) pins BoundedList's absence from the
 * export surface. The former source-readable pin, the retired
 * BoundedListLoading helper-name pin, and the RecipesPage
 * loading-slot scan were deleted: the first two pin
 * implementation detail with no behavioral contract, and
 * RecipesPage's loading rows are RecipesPage's own contract,
 * pinned by its own tests. The separator components are
 * internal functions, so their rendered heights are read by
 * calling the separator the list element carries.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { register } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));

// BoundedList imports react-native, whose Flow-typed source
// plain Node cannot parse; redirect the bare specifier to an
// inert stub before the module is imported. The tests inspect
// the FlatList element's props and call its separator — they
// never render the FlatList itself.
const reactNativeStubUrl =
  "data:text/javascript,export%20function%20FlatList()%7Breturn%20null%3B%7D%0Aexport%20function%20View()%7Breturn%20null%3B%7D%0A";
register(
  `data:text/javascript,${ 
    encodeURIComponent(
      `export async function resolve(specifier, context, nextResolve) {\n` +
        `  if (specifier === "react-native") return { shortCircuit: true, url: ${JSON.stringify(reactNativeStubUrl)} };\n` +
        `  return nextResolve(specifier, context);\n` +
        `}`,
    )}`,
);

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const dist: Record<string, any> = await loadInternalDist();
    const list: Record<string, any> = await import("../../../dist/pages/shared/BoundedList.js");
    const rn: Record<string, any> = await import("react-native");
    return { ...dist, BoundedList: list.BoundedList, FlatList: rn.FlatList, View: rn.View };
  })();
  return runtimePromise;
}

const DATA = [{ id: "a" }, { id: "b" }];
const keyExtractor = (item: { id: string }) => item.id;
const renderItem = () => null;

test("the FlatList is height-bounded with flex: 1, exactly (#188)", async () => {
  const { BoundedList, FlatList } = await loadRuntime();
  const tree = BoundedList({ data: DATA, keyExtractor, renderItem });
  assert.equal(tree.type, FlatList, "BoundedList renders the FlatList itself");
  assert.deepEqual(tree.props.style, { flex: 1 }, "the bounding lands on the FlatList itself");
});

test("row separation is the spacing scale's step 2, rendered by the list itself", async () => {
  const { BoundedList, View } = await loadRuntime();
  const tree = BoundedList({ data: DATA, keyExtractor, renderItem });
  const Separator = tree.props.ItemSeparatorComponent;
  assert.equal(typeof Separator, "function", "the list renders the separator itself by default");
  const separatorEl = Separator({});
  assert.equal(separatorEl.type, View);
  assert.deepEqual(
    separatorEl.props.style,
    { height: 8 },
    "the default separator is the spacing scale's step 2 (8px)",
  );
  const md = BoundedList({ data: DATA, keyExtractor, renderItem, separator: "md" });
  assert.deepEqual(
    md.props.ItemSeparatorComponent({}).props.style,
    { height: 12 },
    "md is the 12px card rhythm (spacing step 3)",
  );
  const none = BoundedList({ data: DATA, keyExtractor, renderItem, separator: "none" });
  assert.equal(none.props.ItemSeparatorComponent, undefined, "separator none renders no separator");
});

test("the API mirrors the FlatList props the pages use — data, keyExtractor, renderItem", async () => {
  const { BoundedList } = await loadRuntime();
  const tree = BoundedList({ data: DATA, keyExtractor, renderItem });
  assert.equal(tree.props.data, DATA);
  assert.equal(tree.props.keyExtractor, keyExtractor);
  assert.equal(tree.props.renderItem, renderItem);
});

test("the catalog slots and handlers are passed through only when given", async () => {
  const { BoundedList } = await loadRuntime();
  const bare = BoundedList({ data: DATA, keyExtractor, renderItem });
  for (const prop of [
    "ListHeaderComponent",
    "ListEmptyComponent",
    "ListFooterComponent",
    "onEndReached",
    "onEndReachedThreshold",
    "onScroll",
    "onLayout",
    "onContentSizeChange",
    "keyboardShouldPersistTaps",
    "contentContainerStyle",
  ]) {
    assert.ok(!(prop in bare.props), `${prop} must not reach the FlatList when not given`);
  }
  const header = () => null;
  const onEndReached = () => { /* noop */ };
  const full = BoundedList({
    data: DATA,
    keyExtractor,
    renderItem,
    ListHeaderComponent: header,
    onEndReached,
    onEndReachedThreshold: 0.5,
    keyboardShouldPersistTaps: "handled",
    contentInset: "page",
  });
  assert.equal(full.props.ListHeaderComponent, header);
  assert.equal(full.props.onEndReached, onEndReached);
  assert.equal(full.props.onEndReachedThreshold, 0.5);
  assert.equal(full.props.keyboardShouldPersistTaps, "handled");
  assert.deepEqual(
    full.props.contentContainerStyle,
    { paddingHorizontal: 16, paddingBottom: 32 },
    "the page content inset is the standard page geometry (spacing steps 4 and 8)",
  );
});

test("BoundedList is internal: not exported from the built pages barrel", async () => {
  const { BoundedList } = await loadRuntime();
  assert.equal(typeof BoundedList, "function", "the internal module loads");
  const types = readFileSync(join(here, "../../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.ok(
    !types.includes("BoundedList"),
    "BoundedList must not be exported from the pages barrel — it is internal page scaffolding (the PageFrame pattern)",
  );
});

// Depth-first search for an element of the given type anywhere
// in an element tree (children may be nested in arrays).
function findByType(node: any, type: any): any {
  if (node === null || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByType(child, type);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (node.type === type) return node;
  return findByType(node.props?.children, type);
}

test("the three fixed-shell list pages render BoundedList", async () => {
  const { BoundedList } = await loadRuntime();
  const verses = [
    { id: "v1", reference: "Ether 12:27", text: "And if men come unto me" },
    { id: "v2", reference: "Moroni 10:4", text: "And when ye shall receive these things" },
  ];
  const verseSearch: Record<string, any> =
    await import("../../../dist/pages/memorize/VerseSearchPage.js");
  const searchTree = verseSearch.VerseSearchPage({
    query: "weakness",
    onQueryChange: () => { /* noop */ },
    onSearch: () => { /* noop */ },
    isSearching: false,
    usingDemo: false,
    errorMessage: null,
    results: verses,
    onAddVerse: () => { /* noop */ },
  });
  assert.ok(findByType(searchTree, BoundedList), "VerseSearchPage must render BoundedList");
  const review: Record<string, any> =
    await import("../../../dist/pages/memorize/MemorizeReviewPage.js");
  const reviewTree = review.MemorizeReviewPage({
    verses,
    onRememberedPress: () => { /* noop */ },
    onForgotPress: () => { /* noop */ },
  });
  assert.ok(findByType(reviewTree, BoundedList), "MemorizeReviewPage must render BoundedList");
  const mine: Record<string, any> = await import("../../../dist/pages/memorize/MyVersesPage.js");
  const mineTree = mine.MyVersesPage({
    verses: verses.map((v) => ({ ...v, drillHref: `/drill/${v.id}`, status: "learning" })),
    onRemoveVerse: () => { /* noop */ },
  });
  assert.ok(findByType(mineTree, BoundedList), "MyVersesPage must render BoundedList");
});
