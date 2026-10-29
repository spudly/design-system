/**
 * Contract test for the shared catalog pagination pattern
 * (spudly/design-system#285): useCatalogPagination, used by both
 * catalog pages — RecipesPage and DiscoverPage.
 *
 * Background: VirtualizedList fires onEndReached once per
 * distinct content length (its _sentEndForContentLength
 * sentinel). When a fetched page adds no new visible rows and
 * nothing else changes the rendered height, the signal cannot
 * fire again and pagination stalls until the user scrolls away
 * and back, even though the host still has a continuation.
 * RecipesPage wired plain onEndReached={onLoadMore} (the stall
 * in full); DiscoverPage (#275) had a mounted-but-guarded
 * handler (no duplicates, no gate-induced stall) but the same
 * no-new-rows stall. The fix is ONE shared pattern, not two
 * local ones, so the catalogs cannot diverge:
 *
 * 1. Mount gate: the handler is undefined unless pagination may
 *    run (canPaginate + a host onLoadMore).
 * 2. Fetch guard: while isFetchingNextPage is set the handler
 *    stays mounted and swallows the request — no duplicate
 *    in-flight requests.
 * 3. Fetch-completion re-arm: on the isFetchingNextPage
 *    true-to-false edge, if the fetch began at the list's end
 *    and the item count is unchanged, onLoadMore fires once
 *    more — independent of any footer measurement, so
 *    consecutive no-new-rows pages paginate through with no
 *    scroll-away. A fetch that added rows clears the end latch
 *    (the list's own content-length change re-arms it).
 *
 * The source scans follow test/discoverPage.test.mjs: the repo
 * has no JS renderer for page components (they import
 * react-native), and the invariants are per-literal properties
 * of the source. Comments are stripped before scanning so prose
 * cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const pagesDir = join(root, "src", "pages");

function readCode(path) {
  return readFileSync(path, "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const hook = readCode(join(pagesDir, "useCatalogPagination.ts"));
const recipesPage = readCode(join(pagesDir, "RecipesPage.tsx"));
const discoverPage = readCode(join(pagesDir, "DiscoverPage.tsx"));

test("the shared hook declares the catalog pagination contract", () => {
  assert.match(hook, /export type CatalogPaginationOptions = \{/);
  assert.match(hook, /onLoadMore\?: \(\(\) => void\) \| undefined;/);
  assert.match(hook, /isFetchingNextPage\?: boolean;/);
  assert.match(hook, /itemCount: number;/);
  assert.match(hook, /canPaginate\?: boolean;/);
  assert.match(hook, /canPaginate\?: boolean;/);
  assert.match(hook, /endReachedThreshold\?: number;/);
  assert.match(hook, /export type CatalogPagination = \{/);
  assert.match(hook, /onEndReached: \(\(\) => void\) \| undefined;/);
  assert.match(hook, /onScroll: \(event: NativeSyntheticEvent<NativeScrollEvent>\) => void;/);
  assert.match(hook, /onEndReachedThreshold: number;/);
  assert.match(hook, /export function useCatalogPagination\(/);
  // Type aliases only (Stephen's code style, #214) — no interfaces.
  assert.ok(!/\binterface\b/.test(hook), "the hook must use type aliases, not interfaces");
});

test("the mount gate: the handler is undefined unless pagination may run", () => {
  assert.match(
    hook,
    /onEndReached: canPaginate && onLoadMore \? handleEndReached : undefined,/,
    "the returned handler must be gated on canPaginate and a host onLoadMore",
  );
});

test("the fetch guard: the mounted handler swallows requests during a fetch", () => {
  assert.match(
    hook,
    /const handleEndReached = \(\) => \{\s*endReachedRef\.current = true;\s*if \(!isFetchingNextPage\) \{\s*onLoadMore\?\.\(\);\s*\}\s*\};/,
    "the handler must latch the end and fire onLoadMore only when no fetch is in flight",
  );
});

test("the re-arm: a no-new-rows fetch completion at the end re-fires onLoadMore", () => {
  // The fetch-start snapshot: the item count is captured on the
  // rising edge of isFetchingNextPage.
  assert.match(
    hook,
    /if \(isFetchingNextPage\) \{\s*if \(!wasFetchingRef\.current\) \{\s*countAtFetchStartRef\.current = itemCount;\s*\}\s*\}/,
    "the hook must snapshot the item count when a fetch begins",
  );
  // A fetch that changed the row count clears the end latch —
  // the list's own content-length change re-arms its signal.
  assert.match(
    hook,
    /if \(countAtFetchStart !== null && itemCount !== countAtFetchStart\) \{\s*endReachedRef\.current = false;\s*\}/,
    "a fetch that added rows must clear the end latch instead of chaining",
  );
  // The re-arm itself: same count, still latched at the end,
  // gate open — fire exactly once more via the latest callback.
  assert.match(
    hook,
    /else if \(canPaginate && endReachedRef\.current && countAtFetchStart !== null\) \{\s*onLoadMoreRef\.current\?\.\(\);\s*\}/,
    "a no-new-rows completion at the end must re-fire onLoadMore once",
  );
  // Edge bookkeeping: the previous-fetching ref is updated on
  // every pass so the edge fires once per completed fetch.
  assert.match(hook, /wasFetchingRef\.current = isFetchingNextPage;/);
});

test("the end latch is live: scroll metrics set and clear it with the shared threshold", () => {
  // The scroll handler recomputes the latch from the native
  // scroll metrics: distance from the end within the threshold
  // fraction of the visible length — the list's own test. A
  // scroll away during a fetch therefore clears the latch and
  // the completion does not chain in the background.
  assert.match(
    hook,
    /const handleScroll = \(event: NativeSyntheticEvent<NativeScrollEvent>\) => \{\s*const \{ contentOffset, contentSize, layoutMeasurement \} = event\.nativeEvent;\s*const distanceFromEnd = contentSize\.height - contentOffset\.y - layoutMeasurement\.height;\s*endReachedRef\.current = distanceFromEnd <= endReachedThreshold \* layoutMeasurement\.height;\s*\};/,
    "the scroll handler must recompute the end latch from the scroll metrics",
  );
  // The callback ref is written inside the effect, never during
  // render, so a discarded render cannot leak its callback.
  assert.match(hook, /useEffect\(\(\) => \{\s*onLoadMoreRef\.current = onLoadMore;/);
  assert.equal(
    hook.match(/onLoadMoreRef\.current = onLoadMore;/g)?.length,
    1,
    "the callback ref must be assigned exactly once — inside the effect, never during render",
  );
});

const catalogPages = [
  ["RecipesPage", recipesPage],
  ["DiscoverPage", discoverPage],
];

test("both catalog pages call the shared hook with the same shape", () => {
  for (const [name, page] of catalogPages) {
    assert.match(
      page,
      /import \{ useCatalogPagination \} from "\.\/useCatalogPagination\.js";/,
      `${name} must import the shared hook`,
    );
    assert.match(
      page,
      /onLoadMore,\s*isFetchingNextPage,\s*itemCount: recipes\.length,/,
      `${name} must pass onLoadMore, isFetchingNextPage, and its recipe count to the hook`,
    );
    assert.match(
      page,
      /const \{ onEndReached, onScroll, onEndReachedThreshold \} = useCatalogPagination\(\{/,
      `${name} must take the hook's handlers and threshold`,
    );
    assert.ok(
      !page.includes("handleEndReached"),
      `${name} must not define a local end-reached handler — the pattern is shared`,
    );
  }
});

test("both catalog pages wire the hook's handlers and threshold to their lists", () => {
  for (const [name, page] of catalogPages) {
    assert.match(
      page,
      /onEndReached=\{onEndReached\}/,
      `${name} must wire the hook's handler to its list`,
    );
    assert.match(
      page,
      /onScroll=\{onScroll\}/,
      `${name} must wire the hook's scroll handler so the end latch stays live`,
    );
    assert.match(
      page,
      /onEndReachedThreshold=\{onEndReachedThreshold\}/,
      `${name} must use the hook's threshold for the list's own signal`,
    );
  }
});

test("each page's mount gate matches its states", () => {
  // RecipesPage gates on the first load only (it has no error
  // state); DiscoverPage also gates on its error state.
  assert.match(recipesPage, /canPaginate: !isLoading,\s*\}\);/);
  assert.match(discoverPage, /canPaginate: !isLoading && !errorMessage,\s*\}\);/);
});

test("RecipesPage no longer wires the plain stalling handler", () => {
  assert.ok(
    !recipesPage.includes("onEndReached={onLoadMore}"),
    "plain onEndReached={onLoadMore} is the #285 stall — it must not return",
  );
});

test("both pages keep the loading-more footer on isFetchingNextPage", () => {
  for (const [name, page] of [
    ["RecipesPage", recipesPage],
    ["DiscoverPage", discoverPage],
  ]) {
    assert.match(page, /isFetchingNextPage \? \(/, `${name}'s footer keys off isFetchingNextPage`);
  }
});
